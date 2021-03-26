// LaTeXエディタ
(function() {

let editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.getSession().setMode("ace/mode/latex");
editor.setFontSize(16);
editor.setOptions({
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: true
});

document.addEventListener('keyup', renderLaTeX);

function renderLaTeX(){
    if (event.isComposing || event.keyCode === 229) {
        return;
    }
    document.getElementById('latex').innerText = '\\(' + editor.getValue() + '\\)';
    MathJax.Hub.Typeset(document.getElementById('latex'));
}

}());

////////////////////////////////////////

// ランダムなモザイク画像生成
(function() {

let colorPalette = [];
let frameColor = "#cccccc";

// 色変更イベント
$("#frame-color").on("change", function(e){
    frameColor = e.target.value;
    // 枠の色を変更
    drawFrame();
    convertToImage();
});

$("#generate-image").on("click", function(e){
    changeImage();
});

// ページ読み込み時に画像生成
changeImage();

// 0~255の整数値3つからカラーコード文字列を生成
function generateColorCode(r, g, b){
    let colorCode = "#" + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
    return colorCode;
}

// RGBカラーコード配列を生成しcolorPaletteを変更
function changeColorPalette(){
    // 選択されている色パターンを取得
    let selectedType = $("input:radio[name='color-type']:checked").val();
    // 新規色パレット
    let newColorPalette = [];
    switch(selectedType){
        case "ランダム":
            for(let i=0; i<4; i++){
                let r = Math.floor(Math.random()*256);
                let g = Math.floor(Math.random()*256);
                let b = Math.floor(Math.random()*256);
                
                newColorPalette.push(generateColorCode(r, g, b));
            }
            break;
        case "モノクロ":
            for(let i=0; i<4; i++){
                let r = Math.floor(Math.random()*256);
                let g = r;
                let b = r;
                
                newColorPalette.push(generateColorCode(r, g, b));
            }
            break;
        case "暖色":
            for(let i=0; i<4; i++){
                let r = 255;
                let g = Math.floor(Math.random()*220);
                let b = Math.floor(Math.random()*220);
                
                newColorPalette.push(generateColorCode(r, g, b));
            }
            break;
        case "寒色":
            for(let i=0; i<4; i++){
                let r = Math.floor(Math.random()*220);
                let g = Math.floor(Math.random()*220);
                let b = 255;
                
                newColorPalette.push(generateColorCode(r, g, b));
            }
            break;
    }

    // パレットを更新
    colorPalette = newColorPalette;
}

// canvasnに描画
function drawImage(){
    let cvs = document.getElementById("cv1");
    let ctx = cvs.getContext("2d");

    // 内側を描画
    for(let i=0; i<8; i++){
        for(let j=0; j<8; j++){
            let randColor = Math.floor(Math.random() * colorPalette.length);
            ctx.fillStyle = colorPalette[randColor];
            ctx.fillRect(20 + 40*i, 20 + 40*j, 40, 40);
        }
    }
}

// フレームを描画
function drawFrame(){
    let cvs = document.getElementById("cv1");
    let ctx = cvs.getContext("2d");

    ctx.fillStyle = frameColor;
    ctx.fillRect(0, 0, cvs.width, 20);
    ctx.fillRect(0, cvs.height - 20, cvs.width, 20);
    ctx.fillRect(0, 0, 20, cvs.height);
    ctx.fillRect(cvs.width - 20, 0, 20, cvs.height);
}

// canvasデータを画像に変換
function convertToImage(){
    let cvs = document.getElementById("cv1");
    let ctx = cvs.getContext("2d");
    
    let png = cvs.toDataURL();
    $("#rand-image").attr("src", png);
}

// 画像変更
function changeImage(){
    changeColorPalette();
    drawImage();
    drawFrame();
    convertToImage();
}

}());

////////////////////////////////////////

// 落書きキャンバス
(function() {

let cx = 0;
let cy = 0;
let dragging = false;
let objWidth = 700;
let objHeight = 500;
let selectedColor = "black";
let selectedSize = 1;
let addColor = "#000000";

let supportTouch = 'ontouchend' in document;
let EVENT_TOUCHSTART = supportTouch ? 'touchstart' : 'mousedown';
let EVENT_TOUCHMOVE = supportTouch ? 'touchmove' : 'mousemove';
let EVENT_TOUCHEND = supportTouch ? 'touchend' : 'mouseup';

let canvas;
let context;


function action(){
    canvas = document.getElementById("cv2");
    context = canvas.getContext("2d");
    context.fillStyle = "white";
    context.fillRect(0, 0, objWidth, objHeight);
    context.fill();

    setColor = document.getElementById("add-color");
    //canvas.addEventListener("event", eventHandler, false);
    //canvas.addEventListener("click", onClick, false);
    canvas.addEventListener(EVENT_TOUCHSTART, onStart, false);
    canvas.addEventListener(EVENT_TOUCHEND, onEnd, false);
    canvas.addEventListener(EVENT_TOUCHMOVE, onMove, false);
    setColor.addEventListener("change", function(e){
        addColor = e.target.value;
        //console.log(addColor);
    }, false);

    // 色ボタン
    $(".color-btn").on("click", function(){
        selectedColor = $(this).attr("value");
    });

    // サイズボタン
    $(".size-btn").on("click", function(){
        selectedSize = Number($(this).attr("value"));
    });

    // クリアボタン
    $("#clear-btn").on("click", function(){
        context.fillStyle = "white";
        context.fillRect(0, 0, objWidth, objHeight);
        context.fill();
    });

    // ダウンロードボタン
    $("#download-btn").on("click", function(){
        if (canvas.msToBlob) { //for IE
            let blob = canvas.msToBlob();
            window.navigator.msSaveBlob(blob, 'download.png');
        } else {
            let a = document.createElement('a');
            a.href = canvas.toDataURL('image/jpeg', 0.85);
            a.download = 'download.jpg';
            a.click();
        }
    });

    // 色セット
    $("add-color").on("change", function(){
        let val = $(this).val();
        //console.log(val);
    });

    // 色追加ボタン
    $("#add-color-btn").on("click", function(){
        let colorList = document.getElementById("color-list");
        colorList.innerHTML += '<button type="button" class="color-btn" style="background-color:'+addColor+'" value="'+addColor+'"></button>';
        $(".color-btn").on("click", function(){
            selectedColor = $(this).attr("value");
        });
    });
}

function onStart(e) {
    if(e.changedTouches) {
        e.preventDefault();
        let clientRect = canvas.getBoundingClientRect();
        let positionX = clientRect.left + window.pageXOffset;
        let positionY = clientRect.top + window.pageYOffset;

        cx = e.changedTouches[0].pageX - positionX ;
        cy = e.changedTouches[0].pageY - positionY ;
        //console.log(cx, cy);
    }else{
        cx = e.layerX;
        cy = e.layerY;
        //console.log(cx, cy);
    }

    // ズレ補正
    cx -= 5;
    cy -= 5;

    context.beginPath();
    context.strokeStyle = selectedColor;
    context.lineCap = 'round';
    context.lineWidth = selectedSize;
    context.moveTo(cx, cy);
    dragging = true;
    onMove(e);
    //context.arc(cx, cy, selectedSize/2, 0, Math.PI*2, true);
}

function onMove(e){
    if(e.changedTouches){
        e.preventDefault();

        let clientRect = canvas.getBoundingClientRect();
        let positionX = clientRect.left + window.pageXOffset;
        let positionY = clientRect.top + window.pageYOffset;

        cx = e.changedTouches[0].pageX - positionX ;
        cy = e.changedTouches[0].pageY - positionY ;
    }else{
        cx = e.layerX;
        cy = e.layerY;
    }

    // ズレ補正
    cx -= 5;
    cy -= 5;

    if(dragging){
        context.lineTo(cx, cy);
        context.stroke();
    }
}

function onEnd(e){
    if(e.changedTouches){
        e.preventDefault();

        let clientRect = canvas.getBoundingClientRect();
        let positionX = clientRect.left + window.pageXOffset;
        let positionY = clientRect.top + window.pageYOffset;

        cx = e.changedTouches[0].pageX - positionX ;
        cy = e.changedTouches[0].pageY - positionY ;
    }else{
        cx = e.layerX;
        cy = e.layerY;
    }

    // ズレ補正
    cx -= 5;
    cy -= 5;

    context.lineTo(cx, cy);
    context.stroke();
    dragging = false;
}

window.onload = action;

}());