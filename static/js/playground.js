/**
 * CodeCraft Interactive Playground
 * Alle interactieve functionaliteit voor de homepage
 */

// ============================================
// 1. LIVE CSS EDITOR
// ============================================
class LiveCSSEditor {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.init();
    }

    init() {
        const textarea = this.container.querySelector('.css-input');
        const preview = this.container.querySelector('.css-preview');
        const styleTag = document.createElement('style');
        styleTag.id = 'live-css-style';
        document.head.appendChild(styleTag);

        textarea.addEventListener('input', () => {
            this.updatePreview(textarea.value, styleTag, preview);
        });

        // Initial render
        this.updatePreview(textarea.value, styleTag, preview);
    }

    updatePreview(css, styleTag, preview) {
        // Scope CSS to preview container
        const scopedCSS = css.replace(/\.demo-box/g, `#${this.container.id} .css-preview .demo-box`);
        styleTag.textContent = scopedCSS;
    }
}

// ============================================
// 2. BOX MODEL PLAYGROUND
// ============================================
class BoxModelPlayground {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.init();
    }

    init() {
        const sliders = this.container.querySelectorAll('input[type="range"]');
        const box = this.container.querySelector('.box-target');
        const codeOutput = this.container.querySelector('.code-output code');

        sliders.forEach(slider => {
            slider.addEventListener('input', () => {
                this.updateBox(sliders, box, codeOutput);
            });
        });

        // Initial
        this.updateBox(sliders, box, codeOutput);
    }

    updateBox(sliders, box, codeOutput) {
        const values = {};
        sliders.forEach(slider => {
            values[slider.dataset.property] = slider.value;
            // Update label
            const label = this.container.querySelector(`label[for="${slider.id}"] span`);
            if (label) label.textContent = slider.value + 'px';
        });

        box.style.margin = `${values.margin || 0}px`;
        box.style.padding = `${values.padding || 0}px`;
        box.style.borderWidth = `${values.border || 0}px`;

        // Update code output
        codeOutput.textContent = `.element {
    margin: ${values.margin || 0}px;
    padding: ${values.padding || 0}px;
    border: ${values.border || 0}px solid #667eea;
    /* Total width = content + padding + border + margin */
}`;
    }
}

// ============================================
// 3. FLEXBOX LABORATORY
// ============================================
class FlexboxLab {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.init();
    }

    init() {
        const flexContainer = this.container.querySelector('.flex-lab-container');
        const controls = this.container.querySelectorAll('select, input');
        const codeOutput = this.container.querySelector('.code-output code');
        const addBtn = this.container.querySelector('.add-item-btn');
        const removeBtn = this.container.querySelector('.remove-item-btn');

        controls.forEach(control => {
            control.addEventListener('change', () => {
                this.updateFlex(flexContainer, controls, codeOutput);
            });
            control.addEventListener('input', () => {
                this.updateFlex(flexContainer, controls, codeOutput);
            });
        });

        if (addBtn) {
            addBtn.addEventListener('click', () => {
                const count = flexContainer.children.length + 1;
                const item = document.createElement('div');
                item.className = 'flex-lab-item';
                item.textContent = count;
                item.style.background = this.getRandomGradient();
                flexContainer.appendChild(item);
            });
        }

        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                if (flexContainer.children.length > 1) {
                    flexContainer.removeChild(flexContainer.lastChild);
                }
            });
        }

        // Initial
        this.updateFlex(flexContainer, controls, codeOutput);
    }

    getRandomGradient() {
        const colors = [
            ['#667eea', '#764ba2'],
            ['#f093fb', '#f5576c'],
            ['#4facfe', '#00f2fe'],
            ['#43e97b', '#38f9d7'],
            ['#fa709a', '#fee140'],
            ['#a18cd1', '#fbc2eb']
        ];
        const pair = colors[Math.floor(Math.random() * colors.length)];
        return `linear-gradient(135deg, ${pair[0]}, ${pair[1]})`;
    }

    updateFlex(container, controls, codeOutput) {
        const values = {};
        controls.forEach(control => {
            if (control.dataset.property) {
                values[control.dataset.property] = control.value;
                container.style[control.dataset.property] = control.value;
            }
        });

        // Update gap label
        const gapLabel = this.container.querySelector('label[for="flex-gap"] span');
        if (gapLabel && values['gap']) gapLabel.textContent = values['gap'] + 'px';

        codeOutput.textContent = `.container {
    display: flex;
    flex-direction: ${values['flexDirection'] || 'row'};
    justify-content: ${values['justifyContent'] || 'flex-start'};
    align-items: ${values['alignItems'] || 'stretch'};
    flex-wrap: ${values['flexWrap'] || 'nowrap'};
    gap: ${values['gap'] || '10'}px;
}`;
    }
}

// ============================================
// 4. CSS GRID BUILDER
// ============================================
class GridBuilder {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.init();
    }

    init() {
        const gridContainer = this.container.querySelector('.grid-builder-container');
        const colsInput = this.container.querySelector('#grid-cols');
        const rowsInput = this.container.querySelector('#grid-rows');
        const gapInput = this.container.querySelector('#grid-gap');
        const codeOutput = this.container.querySelector('.code-output code');

        [colsInput, rowsInput, gapInput].forEach(input => {
            if (input) {
                input.addEventListener('input', () => {
                    this.updateGrid(gridContainer, colsInput, rowsInput, gapInput, codeOutput);
                });
            }
        });

        // Initial
        this.updateGrid(gridContainer, colsInput, rowsInput, gapInput, codeOutput);
    }

    updateGrid(container, colsInput, rowsInput, gapInput, codeOutput) {
        const cols = colsInput?.value || 3;
        const rows = rowsInput?.value || 3;
        const gap = gapInput?.value || 10;

        container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        container.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        container.style.gap = `${gap}px`;

        // Update items
        const totalItems = cols * rows;
        const currentItems = container.children.length;

        if (totalItems > currentItems) {
            for (let i = currentItems; i < totalItems; i++) {
                const item = document.createElement('div');
                item.className = 'grid-item';
                item.textContent = i + 1;
                item.draggable = true;
                container.appendChild(item);
            }
        } else if (totalItems < currentItems) {
            for (let i = currentItems; i > totalItems; i--) {
                container.removeChild(container.lastChild);
            }
        }

        // Update labels
        const colLabel = this.container.querySelector('label[for="grid-cols"] span');
        const rowLabel = this.container.querySelector('label[for="grid-rows"] span');
        const gapLabel = this.container.querySelector('label[for="grid-gap"] span');

        if (colLabel) colLabel.textContent = cols;
        if (rowLabel) rowLabel.textContent = rows;
        if (gapLabel) gapLabel.textContent = gap + 'px';

        codeOutput.textContent = `.grid-container {
    display: grid;
    grid-template-columns: repeat(${cols}, 1fr);
    grid-template-rows: repeat(${rows}, 1fr);
    gap: ${gap}px;
}`;
    }
}

// ============================================
// 5. COLOR MIXER LAB
// ============================================
class ColorMixer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.init();
    }

    init() {
        const rSlider = this.container.querySelector('#color-r');
        const gSlider = this.container.querySelector('#color-g');
        const bSlider = this.container.querySelector('#color-b');
        const aSlider = this.container.querySelector('#color-a');
        const preview = this.container.querySelector('.color-preview-box');
        const codeOutput = this.container.querySelector('.code-output code');
        const copyBtn = this.container.querySelector('.copy-color-btn');

        const sliders = [rSlider, gSlider, bSlider, aSlider].filter(Boolean);

        sliders.forEach(slider => {
            slider.addEventListener('input', () => {
                this.updateColor(rSlider, gSlider, bSlider, aSlider, preview, codeOutput);
            });
        });

        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const r = rSlider?.value || 0;
                const g = gSlider?.value || 0;
                const b = bSlider?.value || 0;
                const hex = this.rgbToHex(parseInt(r), parseInt(g), parseInt(b));
                navigator.clipboard.writeText(hex);
                copyBtn.textContent = 'Gekopieerd!';
                setTimeout(() => copyBtn.textContent = 'Kopieer Hex', 1500);
            });
        }

        // Initial
        this.updateColor(rSlider, gSlider, bSlider, aSlider, preview, codeOutput);
    }

    updateColor(rSlider, gSlider, bSlider, aSlider, preview, codeOutput) {
        const r = rSlider?.value || 0;
        const g = gSlider?.value || 0;
        const b = bSlider?.value || 0;
        const a = aSlider?.value || 1;

        const rgba = `rgba(${r}, ${g}, ${b}, ${a})`;
        const hex = this.rgbToHex(parseInt(r), parseInt(g), parseInt(b));
        const hsl = this.rgbToHsl(parseInt(r), parseInt(g), parseInt(b));

        preview.style.background = rgba;

        // Update slider backgrounds
        if (rSlider) rSlider.style.background = `linear-gradient(to right, rgb(0,${g},${b}), rgb(255,${g},${b}))`;
        if (gSlider) gSlider.style.background = `linear-gradient(to right, rgb(${r},0,${b}), rgb(${r},255,${b}))`;
        if (bSlider) bSlider.style.background = `linear-gradient(to right, rgb(${r},${g},0), rgb(${r},${g},255))`;

        // Update labels
        const rLabel = this.container.querySelector('label[for="color-r"] span');
        const gLabel = this.container.querySelector('label[for="color-g"] span');
        const bLabel = this.container.querySelector('label[for="color-b"] span');
        const aLabel = this.container.querySelector('label[for="color-a"] span');

        if (rLabel) rLabel.textContent = r;
        if (gLabel) gLabel.textContent = g;
        if (bLabel) bLabel.textContent = b;
        if (aLabel) aLabel.textContent = a;

        codeOutput.textContent = `/* Verschillende formaten */
color: ${hex};
color: rgb(${r}, ${g}, ${b});
color: rgba(${r}, ${g}, ${b}, ${a});
color: hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%);`;
    }

    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }
}

// ============================================
// 6. TYPOGRAPHY STUDIO
// ============================================
class TypographyStudio {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.init();
    }

    init() {
        const preview = this.container.querySelector('.typo-preview');
        const fontSelect = this.container.querySelector('#font-family');
        const sizeSlider = this.container.querySelector('#font-size');
        const weightSlider = this.container.querySelector('#font-weight');
        const lineHeightSlider = this.container.querySelector('#line-height');
        const letterSpacingSlider = this.container.querySelector('#letter-spacing');
        const textInput = this.container.querySelector('#typo-text');
        const codeOutput = this.container.querySelector('.code-output code');

        const controls = [fontSelect, sizeSlider, weightSlider, lineHeightSlider, letterSpacingSlider, textInput].filter(Boolean);

        controls.forEach(control => {
            control.addEventListener('input', () => {
                this.updateTypography(preview, fontSelect, sizeSlider, weightSlider, lineHeightSlider, letterSpacingSlider, textInput, codeOutput);
            });
        });

        // Initial
        this.updateTypography(preview, fontSelect, sizeSlider, weightSlider, lineHeightSlider, letterSpacingSlider, textInput, codeOutput);
    }

    updateTypography(preview, fontSelect, sizeSlider, weightSlider, lineHeightSlider, letterSpacingSlider, textInput, codeOutput) {
        const font = fontSelect?.value || 'sans-serif';
        const size = sizeSlider?.value || 16;
        const weight = weightSlider?.value || 400;
        const lineHeight = lineHeightSlider?.value || 1.5;
        const letterSpacing = letterSpacingSlider?.value || 0;
        const text = textInput?.value || 'Preview tekst';

        preview.style.fontFamily = font;
        preview.style.fontSize = `${size}px`;
        preview.style.fontWeight = weight;
        preview.style.lineHeight = lineHeight;
        preview.style.letterSpacing = `${letterSpacing}px`;
        preview.textContent = text;

        // Update labels
        const sizeLabel = this.container.querySelector('label[for="font-size"] span');
        const weightLabel = this.container.querySelector('label[for="font-weight"] span');
        const lineHeightLabel = this.container.querySelector('label[for="line-height"] span');
        const letterSpacingLabel = this.container.querySelector('label[for="letter-spacing"] span');

        if (sizeLabel) sizeLabel.textContent = size + 'px';
        if (weightLabel) weightLabel.textContent = weight;
        if (lineHeightLabel) lineHeightLabel.textContent = lineHeight;
        if (letterSpacingLabel) letterSpacingLabel.textContent = letterSpacing + 'px';

        codeOutput.textContent = `.text {
    font-family: ${font};
    font-size: ${size}px;
    font-weight: ${weight};
    line-height: ${lineHeight};
    letter-spacing: ${letterSpacing}px;
}`;
    }
}

// ============================================
// 7. ANIMATION CREATOR
// ============================================
class AnimationCreator {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.init();
    }

    init() {
        const preview = this.container.querySelector('.animation-preview-box');
        const durationSlider = this.container.querySelector('#anim-duration');
        const delaySlider = this.container.querySelector('#anim-delay');
        const timingSelect = this.container.querySelector('#anim-timing');
        const iterationSelect = this.container.querySelector('#anim-iteration');
        const animTypeSelect = this.container.querySelector('#anim-type');
        const playBtn = this.container.querySelector('.play-animation-btn');
        const codeOutput = this.container.querySelector('.code-output code');

        const controls = [durationSlider, delaySlider, timingSelect, iterationSelect, animTypeSelect].filter(Boolean);

        controls.forEach(control => {
            control.addEventListener('input', () => {
                this.updateAnimation(preview, durationSlider, delaySlider, timingSelect, iterationSelect, animTypeSelect, codeOutput);
            });
            control.addEventListener('change', () => {
                this.updateAnimation(preview, durationSlider, delaySlider, timingSelect, iterationSelect, animTypeSelect, codeOutput);
            });
        });

        if (playBtn) {
            playBtn.addEventListener('click', () => {
                preview.style.animation = 'none';
                preview.offsetHeight; // Trigger reflow
                this.updateAnimation(preview, durationSlider, delaySlider, timingSelect, iterationSelect, animTypeSelect, codeOutput);
            });
        }

        // Initial
        this.updateAnimation(preview, durationSlider, delaySlider, timingSelect, iterationSelect, animTypeSelect, codeOutput);
    }

    updateAnimation(preview, durationSlider, delaySlider, timingSelect, iterationSelect, animTypeSelect, codeOutput) {
        const duration = durationSlider?.value || 1;
        const delay = delaySlider?.value || 0;
        const timing = timingSelect?.value || 'ease';
        const iteration = iterationSelect?.value || '1';
        const type = animTypeSelect?.value || 'bounce';

        preview.style.animation = `${type} ${duration}s ${timing} ${delay}s ${iteration}`;

        // Update labels
        const durationLabel = this.container.querySelector('label[for="anim-duration"] span');
        const delayLabel = this.container.querySelector('label[for="anim-delay"] span');

        if (durationLabel) durationLabel.textContent = duration + 's';
        if (delayLabel) delayLabel.textContent = delay + 's';

        const keyframes = this.getKeyframes(type);

        codeOutput.textContent = `@keyframes ${type} {
${keyframes}
}

.element {
    animation: ${type} ${duration}s ${timing} ${delay}s ${iteration};
}`;
    }

    getKeyframes(type) {
        const keyframes = {
            bounce: `    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-30px); }`,
            pulse: `    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.2); }`,
            shake: `    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }`,
            rotate: `    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }`,
            fadeInOut: `    0%, 100% { opacity: 0.3; }
    50% { opacity: 1; }`,
            slideIn: `    from { transform: translateX(-100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }`,
            swing: `    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(15deg); }
    75% { transform: rotate(-15deg); }`,
            rubberBand: `    0%, 100% { transform: scaleX(1); }
    30% { transform: scaleX(1.25) scaleY(0.75); }
    40% { transform: scaleX(0.75) scaleY(1.25); }
    60% { transform: scaleX(1.15) scaleY(0.85); }`
        };
        return keyframes[type] || keyframes.bounce;
    }
}

// ============================================
// 8. TRANSFORM PLAYGROUND
// ============================================
class TransformPlayground {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.init();
    }

    init() {
        const preview = this.container.querySelector('.transform-preview-box');
        const rotateXSlider = this.container.querySelector('#transform-rotateX');
        const rotateYSlider = this.container.querySelector('#transform-rotateY');
        const rotateZSlider = this.container.querySelector('#transform-rotateZ');
        const scaleSlider = this.container.querySelector('#transform-scale');
        const translateXSlider = this.container.querySelector('#transform-translateX');
        const translateYSlider = this.container.querySelector('#transform-translateY');
        const skewSlider = this.container.querySelector('#transform-skew');
        const perspectiveSlider = this.container.querySelector('#transform-perspective');
        const resetBtn = this.container.querySelector('.reset-transform-btn');
        const codeOutput = this.container.querySelector('.code-output code');

        const sliders = [rotateXSlider, rotateYSlider, rotateZSlider, scaleSlider, translateXSlider, translateYSlider, skewSlider, perspectiveSlider].filter(Boolean);

        sliders.forEach(slider => {
            slider.addEventListener('input', () => {
                this.updateTransform(preview, sliders, perspectiveSlider, codeOutput);
            });
        });

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                sliders.forEach(slider => {
                    if (slider.id === 'transform-scale') slider.value = 1;
                    else if (slider.id === 'transform-perspective') slider.value = 800;
                    else slider.value = 0;
                });
                this.updateTransform(preview, sliders, perspectiveSlider, codeOutput);
            });
        }

        // Initial
        this.updateTransform(preview, sliders, perspectiveSlider, codeOutput);
    }

    updateTransform(preview, sliders, perspectiveSlider, codeOutput) {
        const values = {};
        sliders.forEach(slider => {
            const prop = slider.id.replace('transform-', '');
            values[prop] = slider.value;

            // Update label
            const label = this.container.querySelector(`label[for="${slider.id}"] span`);
            if (label) {
                if (prop === 'scale') label.textContent = slider.value + 'x';
                else if (prop === 'perspective') label.textContent = slider.value + 'px';
                else if (prop.includes('translate')) label.textContent = slider.value + 'px';
                else label.textContent = slider.value + '°';
            }
        });

        const perspective = values.perspective || 800;
        const parent = preview.parentElement;
        if (parent) parent.style.perspective = `${perspective}px`;

        preview.style.transform = `
            rotateX(${values.rotateX || 0}deg)
            rotateY(${values.rotateY || 0}deg)
            rotateZ(${values.rotateZ || 0}deg)
            scale(${values.scale || 1})
            translateX(${values.translateX || 0}px)
            translateY(${values.translateY || 0}px)
            skew(${values.skew || 0}deg)
        `.replace(/\s+/g, ' ').trim();

        codeOutput.textContent = `.parent {
    perspective: ${perspective}px;
}

.element {
    transform:
        rotateX(${values.rotateX || 0}deg)
        rotateY(${values.rotateY || 0}deg)
        rotateZ(${values.rotateZ || 0}deg)
        scale(${values.scale || 1})
        translateX(${values.translateX || 0}px)
        translateY(${values.translateY || 0}px)
        skew(${values.skew || 0}deg);
}`;
    }
}

// ============================================
// 9. GRADIENT GENERATOR
// ============================================
class GradientGenerator {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.colors = ['#667eea', '#764ba2'];
        this.init();
    }

    init() {
        const preview = this.container.querySelector('.gradient-preview-box');
        const typeSelect = this.container.querySelector('#gradient-type');
        const angleSlider = this.container.querySelector('#gradient-angle');
        const color1Input = this.container.querySelector('#gradient-color1');
        const color2Input = this.container.querySelector('#gradient-color2');
        const color3Input = this.container.querySelector('#gradient-color3');
        const copyBtn = this.container.querySelector('.copy-gradient-btn');
        const codeOutput = this.container.querySelector('.code-output code');

        const controls = [typeSelect, angleSlider, color1Input, color2Input, color3Input].filter(Boolean);

        controls.forEach(control => {
            if (control) {
                control.addEventListener('input', () => {
                    this.updateGradient(preview, typeSelect, angleSlider, color1Input, color2Input, color3Input, codeOutput);
                });
            }
        });

        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const css = this.generateGradientCSS(typeSelect, angleSlider, color1Input, color2Input, color3Input);
                navigator.clipboard.writeText(css);
                copyBtn.textContent = 'Gekopieerd!';
                setTimeout(() => copyBtn.textContent = 'Kopieer CSS', 1500);
            });
        }

        // Initial
        this.updateGradient(preview, typeSelect, angleSlider, color1Input, color2Input, color3Input, codeOutput);
    }

    generateGradientCSS(typeSelect, angleSlider, color1Input, color2Input, color3Input) {
        const type = typeSelect?.value || 'linear';
        const angle = angleSlider?.value || 135;
        const color1 = color1Input?.value || '#667eea';
        const color2 = color2Input?.value || '#764ba2';
        const color3 = color3Input?.value || '';

        const colors = color3 ? `${color1}, ${color2}, ${color3}` : `${color1}, ${color2}`;

        if (type === 'linear') {
            return `linear-gradient(${angle}deg, ${colors})`;
        } else if (type === 'radial') {
            return `radial-gradient(circle, ${colors})`;
        } else {
            return `conic-gradient(from ${angle}deg, ${colors})`;
        }
    }

    updateGradient(preview, typeSelect, angleSlider, color1Input, color2Input, color3Input, codeOutput) {
        const css = this.generateGradientCSS(typeSelect, angleSlider, color1Input, color2Input, color3Input);
        preview.style.background = css;

        // Update angle label
        const angleLabel = this.container.querySelector('label[for="gradient-angle"] span');
        if (angleLabel) angleLabel.textContent = (angleSlider?.value || 135) + '°';

        codeOutput.textContent = `.element {
    background: ${css};
}`;
    }
}

// ============================================
// 10. CSS SELECTOR GAME
// ============================================
class SelectorGame {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.score = 0;
        this.currentLevel = 0;
        this.levels = [
            {
                html: '<div class="box"></div>',
                target: '.box',
                hint: 'Selecteer het element met class "box"',
                answer: '.box'
            },
            {
                html: '<div id="hero"></div>',
                target: '#hero',
                hint: 'Selecteer het element met id "hero"',
                answer: '#hero'
            },
            {
                html: '<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>',
                target: 'li',
                hint: 'Selecteer alle list items',
                answer: 'li'
            },
            {
                html: '<div class="card"><p>Tekst</p></div>',
                target: '.card p',
                hint: 'Selecteer de <p> binnen .card',
                answer: '.card p'
            },
            {
                html: '<button class="btn primary">Click</button>',
                target: '.btn.primary',
                hint: 'Selecteer element met beide classes',
                answer: '.btn.primary'
            },
            {
                html: '<input type="text" placeholder="Naam">',
                target: 'input[type="text"]',
                hint: 'Selecteer input met type="text"',
                answer: 'input[type="text"]'
            },
            {
                html: '<ul><li>A</li><li>B</li><li>C</li></ul>',
                target: 'li:first-child',
                hint: 'Selecteer alleen de eerste <li>',
                answer: 'li:first-child'
            },
            {
                html: '<p>Hover me!</p>',
                target: 'p:hover',
                hint: 'Selecteer <p> bij hover',
                answer: 'p:hover'
            }
        ];

        this.init();
    }

    init() {
        this.htmlDisplay = this.container.querySelector('.game-html-display');
        this.input = this.container.querySelector('#selector-input');
        this.submitBtn = this.container.querySelector('.check-selector-btn');
        this.hintDisplay = this.container.querySelector('.game-hint');
        this.scoreDisplay = this.container.querySelector('.game-score');
        this.feedback = this.container.querySelector('.game-feedback');
        this.nextBtn = this.container.querySelector('.next-level-btn');
        this.previewArea = this.container.querySelector('.game-preview');

        if (this.submitBtn) {
            this.submitBtn.addEventListener('click', () => this.checkAnswer());
        }

        if (this.input) {
            this.input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.checkAnswer();
            });
        }

        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => {
                this.currentLevel++;
                if (this.currentLevel >= this.levels.length) {
                    this.currentLevel = 0;
                    this.showFinalScore();
                } else {
                    this.loadLevel();
                }
            });
        }

        this.loadLevel();
    }

    loadLevel() {
        const level = this.levels[this.currentLevel];

        if (this.htmlDisplay) {
            this.htmlDisplay.textContent = level.html;
        }

        if (this.previewArea) {
            this.previewArea.innerHTML = level.html;
        }

        if (this.hintDisplay) {
            this.hintDisplay.textContent = level.hint;
        }

        if (this.input) {
            this.input.value = '';
            this.input.focus();
        }

        if (this.feedback) {
            this.feedback.textContent = '';
            this.feedback.className = 'game-feedback';
        }

        if (this.nextBtn) {
            this.nextBtn.style.display = 'none';
        }

        // Update level indicator
        const levelIndicator = this.container.querySelector('.game-level');
        if (levelIndicator) {
            levelIndicator.textContent = `Level ${this.currentLevel + 1}/${this.levels.length}`;
        }
    }

    checkAnswer() {
        const level = this.levels[this.currentLevel];
        const userAnswer = this.input?.value.trim();

        if (!userAnswer) return;

        // Check if the selector is valid and matches the target
        let isCorrect = false;
        try {
            isCorrect = userAnswer === level.answer ||
                        (this.previewArea && this.previewArea.querySelector(userAnswer) &&
                         this.previewArea.querySelector(level.answer) === this.previewArea.querySelector(userAnswer));
        } catch (e) {
            isCorrect = false;
        }

        if (isCorrect) {
            this.score += 10;
            if (this.feedback) {
                this.feedback.textContent = 'Correct! +10 punten';
                this.feedback.className = 'game-feedback correct';
            }
            if (this.nextBtn) {
                this.nextBtn.style.display = 'inline-block';
            }

            // Highlight matched elements
            if (this.previewArea) {
                try {
                    const matched = this.previewArea.querySelectorAll(userAnswer);
                    matched.forEach(el => el.classList.add('highlighted'));
                } catch (e) {}
            }
        } else {
            if (this.feedback) {
                this.feedback.textContent = `Probeer opnieuw! Hint: ${level.answer}`;
                this.feedback.className = 'game-feedback incorrect';
            }
        }

        if (this.scoreDisplay) {
            this.scoreDisplay.textContent = `Score: ${this.score}`;
        }
    }

    showFinalScore() {
        if (this.feedback) {
            this.feedback.textContent = `Klaar! Totale score: ${this.score}/${this.levels.length * 10}`;
            this.feedback.className = 'game-feedback final';
        }
        this.score = 0;
        if (this.nextBtn) {
            this.nextBtn.textContent = 'Opnieuw spelen';
            this.nextBtn.style.display = 'inline-block';
        }
    }
}

// ============================================
// 11. SHADOW GENERATOR
// ============================================
class ShadowGenerator {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.init();
    }

    init() {
        const preview = this.container.querySelector('.shadow-preview-box');
        const hOffsetSlider = this.container.querySelector('#shadow-h-offset');
        const vOffsetSlider = this.container.querySelector('#shadow-v-offset');
        const blurSlider = this.container.querySelector('#shadow-blur');
        const spreadSlider = this.container.querySelector('#shadow-spread');
        const colorInput = this.container.querySelector('#shadow-color');
        const insetCheckbox = this.container.querySelector('#shadow-inset');
        const copyBtn = this.container.querySelector('.copy-shadow-btn');
        const codeOutput = this.container.querySelector('.code-output code');

        const controls = [hOffsetSlider, vOffsetSlider, blurSlider, spreadSlider, colorInput, insetCheckbox].filter(Boolean);

        controls.forEach(control => {
            control.addEventListener('input', () => {
                this.updateShadow(preview, hOffsetSlider, vOffsetSlider, blurSlider, spreadSlider, colorInput, insetCheckbox, codeOutput);
            });
        });

        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const css = this.generateShadowCSS(hOffsetSlider, vOffsetSlider, blurSlider, spreadSlider, colorInput, insetCheckbox);
                navigator.clipboard.writeText(`box-shadow: ${css};`);
                copyBtn.textContent = 'Gekopieerd!';
                setTimeout(() => copyBtn.textContent = 'Kopieer CSS', 1500);
            });
        }

        // Initial
        this.updateShadow(preview, hOffsetSlider, vOffsetSlider, blurSlider, spreadSlider, colorInput, insetCheckbox, codeOutput);
    }

    generateShadowCSS(hOffset, vOffset, blur, spread, color, inset) {
        const h = hOffset?.value || 0;
        const v = vOffset?.value || 0;
        const b = blur?.value || 10;
        const s = spread?.value || 0;
        const c = color?.value || 'rgba(0,0,0,0.3)';
        const i = inset?.checked ? 'inset ' : '';

        return `${i}${h}px ${v}px ${b}px ${s}px ${c}`;
    }

    updateShadow(preview, hOffset, vOffset, blur, spread, color, inset, codeOutput) {
        const css = this.generateShadowCSS(hOffset, vOffset, blur, spread, color, inset);
        preview.style.boxShadow = css;

        // Update labels
        const labels = {
            'shadow-h-offset': hOffset?.value + 'px',
            'shadow-v-offset': vOffset?.value + 'px',
            'shadow-blur': blur?.value + 'px',
            'shadow-spread': spread?.value + 'px'
        };

        Object.entries(labels).forEach(([id, value]) => {
            const label = this.container.querySelector(`label[for="${id}"] span`);
            if (label) label.textContent = value;
        });

        codeOutput.textContent = `.element {
    box-shadow: ${css};
}`;
    }
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all playgrounds
    new LiveCSSEditor('live-css-editor');
    new BoxModelPlayground('box-model-playground');
    new FlexboxLab('flexbox-lab');
    new GridBuilder('grid-builder');
    new ColorMixer('color-mixer');
    new TypographyStudio('typography-studio');
    new AnimationCreator('animation-creator');
    new TransformPlayground('transform-playground');
    new GradientGenerator('gradient-generator');
    new SelectorGame('selector-game');
    new ShadowGenerator('shadow-generator');

    console.log('CodeCraft Playgrounds initialized!');
});
