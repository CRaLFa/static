(function () {

    /** @type {CanvasRenderingContext2D} */
    let context;

    /** @type {ImageData} */
    let tmpData;

    /** @type {boolean} */
    let isGray;

    /** @type {boolean} */
    let isPickMode;

    /** @type {number} */
    const CANVAS_SIZE = 800;

    $(function () {
        $('#inputImage').on('change', function () {
            clear();
            showImage(this.files[0]);
        });

        $('#flipButton').on('click', function () {
            flip();
        });

        $('#turnButton').on('click', function () {
            turn();
        });

        $('#invertButton').on('click', function () {
            invert();
        });

        $('#grayscaleButton').on('click', function () {
            grayscale();
        });

        $('#downloadButton').on('click', function () {
            download();
        });

        $('#clearButton').on('click', function () {
            $('#inputImage').val('');
            clear();
        });

        $('#canvas').on('click', function () {
            changeMode(!isPickMode);
        });

        context = $('#canvas').get(0).getContext('2d');
    });

    /**
     * @param {File} file
     */
    function showImage(file) {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);

        fileReader.onload = function () {
            const image = new Image();
            image.src = this.result;

            image.onload = function () {
                drawImage(this);
            };
        };
    }

    /**
     * @param {HTMLImageElement} image
     */
    function drawImage(image) {
        const beforeW = image.naturalWidth;
        const beforeH = image.naturalHeight;

        const geoMean = Math.sqrt(beforeW * beforeH);

        const afterW = (geoMean > CANVAS_SIZE) ? (beforeW * CANVAS_SIZE / geoMean) : beforeW;
        const afterH = (geoMean > CANVAS_SIZE) ? (beforeH * CANVAS_SIZE / geoMean) : beforeH;

        $('#canvas').attr('width', afterW);
        $('#canvas').attr('height', afterH);

        $('#canvas').on('mousemove', function (e) {
            pick(e);
        });

        context.drawImage(image, 0, 0, beforeW, beforeH, 0, 0, afterW, afterH);
        isGray = false;
        changeMode(true);
    }

    function flip() {
        if (!$('#inputImage').val()) {
            alert("画像ファイルを選択してください。");
            return;
        }

        canvas = context.canvas;
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const anotherData = data.slice();

        let i, j;
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                i = (canvas.width * y + x) * 4;
                j = (canvas.width * (y + 1) - (x + 1)) * 4;
                data[i] = anotherData[j];
                data[i + 1] = anotherData[j + 1];
                data[i + 2] = anotherData[j + 2];
                data[i + 3] = anotherData[j + 3];
            }
        }

        context.putImageData(imageData, 0, 0);
        changeMode(true);
    }

    function turn() {
        if (!$('#inputImage').val()) {
            alert("画像ファイルを選択してください。");
            return;
        }

        canvas = context.canvas;
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const anotherData = data.slice();

        let j;
        for (let i = 0; i < data.length; i += 4) {
            j = (canvas.width * canvas.height - 1) * 4 - i;
            data[i] = anotherData[j];
            data[i + 1] = anotherData[j + 1];
            data[i + 2] = anotherData[j + 2];
            data[i + 3] = anotherData[j + 3];
        }

        context.putImageData(imageData, 0, 0);
        changeMode(true);
    }

    function invert() {
        if (!$('#inputImage').val()) {
            alert("画像ファイルを選択してください。");
            return;
        }

        canvas = context.canvas;
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];
            data[i + 1] = 255 - data[i + 1];
            data[i + 2] = 255 - data[i + 2];
        }

        context.putImageData(imageData, 0, 0);
        changeMode(true);
    }

    function grayscale() {
        if (!$('#inputImage').val()) {
            alert("画像ファイルを選択してください。");
            return;
        }

        if (isGray) {
            context.putImageData(tmpData, 0, 0);
            isGray = false;
            changeMode(true);
            return;
        }

        canvas = context.canvas;
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        tmpData = context.getImageData(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < data.length; i += 4) {
            const average = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = average;
            data[i + 1] = average;
            data[i + 2] = average;
        }

        context.putImageData(imageData, 0, 0);
        isGray = true;
        changeMode(true);
    }

    function download() {
        if (!$('#inputImage').val()) {
            alert("画像ファイルを選択してください。");
            return;
        }

        const dataURL = $('#canvas').get(0).toDataURL();
        $('#download').attr('href', dataURL);
    }

    function clear() {
        canvas = context.canvas;
        context.clearRect(0, 0, canvas.width, canvas.height);

        canvas.width = 300;
        canvas.height = 150;

        $('#download').removeAttr('href');
        $('#color').empty();
        $('#color').css('background-color', '#fffff7');
        $('#canvas').css('cursor', 'default');

        tmpData = null;
    }

    /**
     * @param {JQuery.MouseMoveEvent} e
     */
    function pick(e) {
        if (!$('#inputImage').val()) {
            return;
        }

        const pixel = context.getImageData(e.offsetX, e.offsetY, 1, 1);
        const data = pixel.data;
        const r = data[0];
        const g = data[1];
        const b = data[2];

        const hexColorCode = getColorCode(r, g, b);
        $('#color').css('background-color', hexColorCode);
        $('#color').css('color', blackOrWhite(r, g, b));
        $('#color').html("R:" + r + " G:" + g + " B:" + b + "<br>" + hexColorCode);
    }

    /**
     * @param {number} r
     * @param {number} g
     * @param {number} b
     * @returns {string}
     */
    function getColorCode(r, g, b) {
        const hexR = ("0" + r.toString(16)).slice(-2);
        const hexG = ("0" + g.toString(16)).slice(-2);
        const hexB = ("0" + b.toString(16)).slice(-2);
        return "#" + hexR + hexG + hexB;
    }

    /**
     * @param {number} r
     * @param {number} g
     * @param {number} b
     * @returns {string}
     */
    function blackOrWhite(r, g, b) {
        return (r * 299 + g * 587 + b * 114) < 128000 ? "#ffffff" : "#000000";
    }

    /**
     * @param {boolean} pickModeFlg
     */
    function changeMode(pickModeFlg) {
        if (!$('#inputImage').val()) {
            return;
        }
        pickModeFlg ? enablePickMode() : disablePickMode();
    }

    function enablePickMode() {
        $('#canvas').on('mousemove', function (e) {
            pick(e);
        });
        $('#canvas').css('cursor', 'pointer');
        isPickMode = true;
    };

    function disablePickMode() {
        $('#canvas').off('mousemove');
        $('#canvas').css('cursor', 'default');
        isPickMode = false;
    };

})();
