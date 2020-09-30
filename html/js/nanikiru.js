(() => {

    const tiles = [...Array(136).keys()].map(n => n % 34);

    const shuf = (arr) => {
        for (let i = arr.length - 1; i >= 0; i--) {
            const r = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[r]] = [arr[r], arr[i]];
        }
    };

    const sort = (arr) => {
        const tmp = arr.map(n => (n < 7) ? n + 34 : n);
        tmp.sort((a, b) => a - b);
        return tmp.map(n => (n > 33) ? n - 34 : n);
    };

    $('#reload').on('click', () => {
        shuf(tiles);
        const handTiles = sort(tiles.slice(0, 14));
        const codePoints = handTiles.map(n => 0x1F000 + n);
        $('#result').text(String.fromCodePoint(...codePoints));
    });

    $('#reload').trigger('click');

})();
