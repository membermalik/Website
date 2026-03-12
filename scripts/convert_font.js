const fs = require('fs');
const opentype = require('opentype.js');

const fontPath = process.argv[2];
const outPath = process.argv[3];

opentype.load(fontPath, function (err, font) {
    if (err) {
        console.error('Font could not be loaded: ' + err);
        process.exit(1);
    }

    const scale = (1000 * 100) / (font.unitsPerEm || 2048);
    const result = {
        glyphs: {},
        boundingBox: {
            yMin: font.tables.os2.sTypoDescender,
            xMin: font.tables.head.xMin,
            yMax: font.tables.os2.sTypoAscender,
            xMax: font.tables.head.xMax
        },
        ascender: Math.round(font.ascender * scale),
        descender: Math.round(font.descender * scale),
        familyName: font.names.fontFamily.en,
        resolution: 1000,
        original_font_information: font.tables.name
    };

    for (let i = 0; i < font.glyphs.length; i++) {
        const glyph = font.glyphs.glyphs[i];
        if (glyph.unicode !== undefined) {
            const token = {
                ha: Math.round(glyph.advanceWidth * scale),
                x_min: Math.round(glyph.xMin * scale),
                x_max: Math.round(glyph.xMax * scale),
                o: ''
            };
            const path = glyph.path;
            for (let j = 0; j < path.commands.length; j++) {
                const cmd = path.commands[j];
                if (cmd.type === 'M') {
                    token.o += 'm ' + Math.round(cmd.x * scale) + ' ' + Math.round(cmd.y * scale) + ' ';
                } else if (cmd.type === 'L') {
                    token.o += 'l ' + Math.round(cmd.x * scale) + ' ' + Math.round(cmd.y * scale) + ' ';
                } else if (cmd.type === 'Q') {
                    token.o += 'q ' + Math.round(cmd.x1 * scale) + ' ' + Math.round(cmd.y1 * scale) + ' ' + Math.round(cmd.x * scale) + ' ' + Math.round(cmd.y * scale) + ' ';
                } else if (cmd.type === 'Z') {
                    token.o += 'z ';
                }
            }
            result.glyphs[String.fromCharCode(glyph.unicode)] = token;
        }
    }

    fs.writeFileSync(outPath, JSON.stringify(result));
    console.log('Successfully converted ' + fontPath + ' to ' + outPath);
});
