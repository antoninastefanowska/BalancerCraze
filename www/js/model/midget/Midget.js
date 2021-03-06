import { changeContainerOrigin, changeSpriteOrigin, scaleValue, getGlobalPosition, TILT_DURATION, BASE_SPRITE_PATH } from '../../Utils';
import MidgetHead from './MidgetHead';
import MidgetArms from './MidgetArms';

const NORMAL = 0;
const BIG = 1;

const COLORS = [0x5cd3ff, 0x6d5cff, 0xff885c, 0xfff55c, 0x5cffa3];

const FALL_DURATION = 500;

class Midget {
    constructor(color, x, y) {
        this.height = 283;
        this.width = 193;
        this.weight = 50;
        this.color = color;
        this.x = x;
        this.y = y;
        this.chainPoint = {
            x: -123,
            y: 125
        };
    }

    static get NORMAL() {
        return NORMAL;
    }

    static get BIG() {
        return BIG;
    }

    static loadAssets(context) {
        context.load.image('midget-hat', BASE_SPRITE_PATH + 'midget-hat.png');
        context.load.image('midget-head', BASE_SPRITE_PATH + 'midget-head.png');
        context.load.spritesheet('midget-face', BASE_SPRITE_PATH + 'midget-face.png', { frameWidth: 58, frameHeight: 56 });

        context.load.spritesheet('midget-arm-left', BASE_SPRITE_PATH + 'midget-arm-left.png', { frameWidth: 98, frameHeight: 130 });
        context.load.spritesheet('midget-arm-right', BASE_SPRITE_PATH + 'midget-arm-right.png', { frameWidth: 99, frameHeight: 131 });
        context.load.spritesheet('midget-grip-left', BASE_SPRITE_PATH + 'midget-grip-left.png', { frameWidth: 50, frameHeight: 33 });
        context.load.spritesheet('midget-grip-right', BASE_SPRITE_PATH + 'midget-grip-right.png', { frameWidth: 49, frameHeight: 33 });

        context.load.image('midget-leg-left', BASE_SPRITE_PATH + 'midget-leg-left.png');
        context.load.image('midget-leg-right', BASE_SPRITE_PATH + 'midget-leg-right.png');
        context.load.image('midget-body', BASE_SPRITE_PATH + 'midget-body.png');
        context.load.image('midget-skirt', BASE_SPRITE_PATH + 'midget-skirt.png');
        context.load.image('midget-scarf', BASE_SPRITE_PATH + 'midget-scarf.png');
    }

    create(context) {
        this.container = context.add.container(this.x, this.y);
        this.frontContainer = context.add.container(this.x, this.y);

        this.backBodyCont = context.add.container(0, 13);
        this.midBodyCont = context.add.container(0, 13);
        this.frontBodyCont = context.add.container(0, 13);

        this.head = new MidgetHead();
        this.arms = new MidgetArms(this.x, this.y);

        this.head.createHat(context, this.backBodyCont);
        this.container.add(this.backBodyCont);
        this.arms.createArms(context, this.container);

        this.legsCont = context.add.container(72, 156);
        this.leftLeg = context.add.image(0, 0, 'midget-leg-left').setOrigin(0);
        this.rightLeg = context.add.image(40, 0, 'midget-leg-right').setOrigin(0);
        this.legsCont.add([this.leftLeg, this.rightLeg]);
        this.midBodyCont.add(this.legsCont);

        this.torsoCont = context.add.container(16, 91);
        this.torso = context.add.image(52, 0, 'midget-body').setOrigin(0);
        this.skirt = context.add.image(25, 62, 'midget-skirt').setOrigin(0);
        this.torsoCont.add([this.torso, this.skirt]);

        this.scarf = context.add.image(47, 74, 'midget-scarf').setOrigin(0);
        this.frontBodyCont.add([this.torsoCont, this.scarf]);
        this.head.createHead(context, this.frontBodyCont);

        this.container.add(this.midBodyCont);
        this.frontContainer.add(this.frontBodyCont);

        this.arms.createGrips(context);

        changeContainerOrigin(this.backBodyCont, { x: 123, y: 95 });
        changeContainerOrigin(this.midBodyCont, { x: 123, y: 95 });
        changeContainerOrigin(this.frontBodyCont, { x: 123, y: 95 });

        changeContainerOrigin(this.torsoCont, { x: 108, y: 40 });
        changeSpriteOrigin(this.scarf, { x: 76, y: 12 });
        changeSpriteOrigin(this.head.hat, { x: 105, y: 7 });

        changeContainerOrigin(this.legsCont, { x: 50, y: 13 });
        
        this.updateColor();
    }

    updateAnimation(progress) {
        let progress2 = progress * 2;
        progress2 = progress2 > 1.0 ? 1.0 - progress2 + 1.0 : progress2; 

        let torsoAngle = scaleValue(progress, -15, 10);
        let scarfAngle = -torsoAngle;
        let hatScale = scaleValue(progress2, 1.0, 1.2);
        let faceY = scaleValue(progress2, this.head.getFaceLevel() - 3, this.head.getFaceLevel() + 3);

        this.torsoCont.setAngle(torsoAngle);
        this.scarf.setAngle(scarfAngle);
        this.head.hat.setScale(1.0, hatScale);
        this.head.faceCont.setY(faceY);
    }

    getType() {
        return NORMAL;
    }

    addToContainer(container) {
        this.arms.addGripsToContainer(container);
        container.add(this.container);
        container.add(this.frontContainer);
        container.sendToBack(this.container);
        container.bringToTop(this.frontContainer);
    }

    addToContainerAt(container, x, y) {
        this.addToContainer(container);
        this.changePosition(x, y);
    }

    addToDoubleContainer(backContainer, frontContainer) {
        backContainer.add(this.container);
        frontContainer.add(this.frontContainer);
        this.arms.addGripsToContainer(frontContainer);
    }

    removeFromDoubleContainer(backContainer, frontContainer) {
        backContainer.remove(this.container);
        frontContainer.remove(this.frontContainer);
        this.arms.removeGripsFromContainer(frontContainer);
    }

    chainAnother(midget) {
        midget.changePosition(this.chainPoint.x, this.chainPoint.y);
        this.backBodyCont.add(midget.container);
        this.frontBodyCont.add(midget.frontContainer);
        midget.arms.addGripsToContainer(this.frontBodyCont);
        midget.arms.sendGripsToBack(this.frontBodyCont);
    }

    unchainAnother(midget) {
        this.backBodyCont.remove(midget.container);
        this.frontBodyCont.remove(midget.frontContainer);
        midget.arms.removeGripsFromContainer(this.frontBodyCont);
    }

    removeFromContainer(container) {
        this.arms.removeGripsFromContainer(container);
        container.remove(this.container);
        container.remove(this.frontContainer);
    }

    hide() {
        this.arms.hide();
        this.container.setActive(false).setVisible(false);
        this.frontContainer.setActive(false).setVisible(false);
    }

    show() {
        this.arms.show();
        this.container.setActive(true).setVisible(true);
        this.frontContainer.setActive(true).setVisible(true);
    }

    bringBodyToTop(container) {
        container.bringToTop(this.frontContainer);
    }

    updateColor() {
        this.applyTint(COLORS[this.color]);
    }

    async fall(context, y, onFallen) {
        return new Promise((resolve, reject) => {
            context.tweens.add({
                targets: [this.container, this.frontContainer, this.arms.globalGripsCont],
                y: y,
                duration: FALL_DURATION,
                ease: 'Quad.In',
                onComplete: resolve
            });
        });
    }

    fallAndHide(context, y) {
        context.tweens.add({
            targets: [this.container, this.frontContainer, this.arms.globalGripsCont],
            y: y,
            duration: FALL_DURATION,
            ease: 'Quad.In',
            onComplete: () => this.hide()
        });
    }

    changePosition(x, y) {
        this.changePositionWithoutOffset(x, y);
    }

    changePositionWithoutOffset(x, y) {
        this.x = x;
        this.y = y;
        this.container.setPosition(x, y);
        this.frontContainer.setPosition(x, y);
        this.arms.changePosition(x, y);
    }

    changeColor(color) {
        this.color = color;
    }

    applyTint(color) {
        this.head.applyTint(color);
        this.arms.applyTint(color);

        this.leftLeg.setTint(color);
        this.rightLeg.setTint(color);
        this.torso.setTint(color);
        this.skirt.setTint(color);
        this.scarf.setTint(color);
    }

    addClickCallback(callback) {
        this.head.addClickCallback(callback);
        this.arms.addClickCallback(callback);

        this.leftLeg.setInteractive();
        this.rightLeg.setInteractive();
        this.torso.setInteractive();
        this.skirt.setInteractive();
        this.scarf.setInteractive();

        this.leftLeg.on('pointerdown', callback);
        this.rightLeg.on('pointerdown', callback);
        this.torso.on('pointerdown', callback);
        this.skirt.on('pointerdown', callback);
        this.scarf.on('pointerdown', callback);
    }

    removeClickCallback() {
        this.head.removeClickCallback();
        this.arms.removeClickCallback();

        this.leftLeg.removeAllListeners();
        this.rightLeg.removeAllListeners();
        this.torso.removeAllListeners();
        this.skirt.removeAllListeners();
        this.scarf.removeAllListeners();

        this.leftLeg.disableInteractive();
        this.rightLeg.disableInteractive();
        this.torso.disableInteractive();
        this.skirt.disableInteractive();
        this.scarf.disableInteractive();
    }

    changeArmsAngle(angle) {
        this.arms.changeArmsAngle(angle);
    }

    changeBodyAngle(angle, context) {
        context.tweens.add({
            targets: [this.backBodyCont, this.midBodyCont, this.frontBodyCont],
            rotation: angle,
            duration: TILT_DURATION,
            ease: 'Elastic',
            easeParams: [1.0, 0.3]
        });
    }

    getGlobalPosition(scrollY = 0) {
        let position = getGlobalPosition(this.container);
        position.y -= scrollY;
        return position;
    }

    getHeight() {
        return this.height;
    }

    getWidth() {
        return this.width;
    }

    getWeight() {
        return this.weight;
    }

    getColor() {
        return this.color;
    }

    changeArms1() {
        this.arms.changeArms1();
    }

    changeArms2() {
        this.arms.changeArms2();
    }

    changeArms3() {
        this.arms.changeArms3();
    }

    changeFace1() {
        this.head.changeFace1();
    }

    changeFace2() {
        this.head.changeFace2();
    }

    changeFace3() {
        this.head.changeFace3();
    }

    recycle(color, x, y) {
        this.changeArms1();
        this.changeFace1();
        this.changeColor(color);
        this.updateColor();
        this.changePosition(x, y);
        this.removeClickCallback();
        this.show();
    }
}

export default Midget;