const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const image = new Image();


class AsciiCell {
  constructor(x, y, ascii, color) {
    this.x = x;
    this.y = y;
    this.ascii = ascii;
    this.color = color;
  }
  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillText(this.ascii, this.x, this.y);
  }
}


class AsciiManager {
  #imageCellArr = [];
  #asciiCharactersArr = [];
  #imageDataArr = [];
  #ctx;
  #width;
  #height;
  constructor(ctx, width, height) {
    this.#ctx = ctx;
    this.#width = width;
    this.#height = height;
    this.#ctx.drawImage(image, 0, 0, this.#width, this.#height);
    this.#imageDataArr = this.#ctx.getImageData(0, 0, this.#width, this.#height);
  }

  #convertToAscii(pixelAvg) {
    const asciiSymbols = ".,;:i1LCÇOQNMKW";
    const idx = Math.floor((pixelAvg / 255) * (asciiSymbols.length - 1));
    return asciiSymbols[idx];
  }

  #scanImage(resolution) {
    // TODO: Check if resolution is valid
    this.#imageCellArr = [];
    for (let y = 0; y < this.#imageDataArr.height; y += resolution) {
      for (let x = 0; x < this.#imageDataArr.width; x += resolution) {
        const coordX = x * 4; // imageData pixel arr is rbga, so every 4 items is a pixel
        const coordY = y * 4;
        const coord = (coordY * this.#imageDataArr.width) + coordX;
        if (this.#imageDataArr.data[coord + 3] > 64) { // If alpha value is > 64
          const valueR = this.#imageDataArr.data[coord];
          const valueG = this.#imageDataArr.data[coord + 1];
          const valueB = this.#imageDataArr.data[coord + 2];
          let valueAvg = (valueR + valueG + valueB) / 3;
          const asciiCharacter = this.#convertToAscii(valueAvg);
          const color = "rgb(" + valueR + "," + valueG + "," + valueB + ")";
          this.#imageCellArr.push(new AsciiCell(x, y, asciiCharacter, color));
        }
      }
    }
  }

  #drawAscii() {
    this.#ctx.clearRect(0, 0, this.#width, this.#height);
    for (let i = 0; i < this.#imageCellArr.length; i++) {
      this.#imageCellArr[i].draw(this.#ctx);
    }
  }

  draw(resolution) {
    this.#scanImage(resolution);
    this.#drawAscii();
  }
}


function loadFile(filePath) {
  var result = null;
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", filePath, false);
  xmlhttp.send();
  if (xmlhttp.status==200) {
    result = xmlhttp.responseText;
  }
  return result;
}


function parseImageArray(text) {
  const fileArr = text.match(/\w+.jpg/g);
  // Convert arr to set and back to remove duplicates
  const set = new Set(fileArr);
  const returnArr = [...set];
  return returnArr;
}


const fileStr = loadFile("images/");
const imageStrArr = parseImageArray(fileStr);
const randomImage = imageStrArr[Math.floor(Math.random() * imageStrArr.length)];
console.log(randomImage);
image.src = "images/" + randomImage;

let manager;
image.onload = function init() {
  canvas.width = image.width;
  canvas.height = image.height;
  manager = new AsciiManager(ctx, image.width, image.height);
  manager.draw(10);
}
