import Phaser from 'phaser';

import { getGlobalPosition, BASE_GUI_PATH, STEP_DURATION, ART_HEIGHT } from '../../../Utils';
import Midget from '../../midget/Midget';

class Slot {
    constructor(pole) {
        this.position = {
            x: 0,
            y: 0
        };
        this.angle = 0;
        this.weight = 0;
        this.size = 0;
        this.midgets = [];
        this.pole = pole;
    }

    static loadAssets(context) {
        context.load.spritesheet('arrow', BASE_GUI_PATH + 'arrows.png', { frameWidth: 154, frameHeight: 201 });
    }

    createContainer(context, parentContainer) {
        this.backContainer = context.add.container(this.position.x, this.position.y);
        this.frontContainer = context.add.container(this.position.x, this.position.y);
        parentContainer.add([this.backContainer, this.frontContainer]);
        parentContainer.sendToBack(this.backContainer);

        this.frontContainer.setInteractive(new Phaser.Geom.Circle(110, 30, 110), Phaser.Geom.Circle.Contains);
        this.frontContainer.on('pointerdown', () => this.onAddMidget(context));
    }

    createArrow(context) {
        this.arrow = context.add.image(110, -110, 'arrow');
        this.backContainer.add(this.arrow);

        context.tweens.add({
            targets: this.arrow,
            y: -80,
            duration: STEP_DURATION / 2,
            yoyo: true,
            loop: -1,
            ease: 'Quad.InOut'
        });
    }

    async onAddMidget(context) {
        await context.swing.hideAway(context);
        let midget = context.swing.removeMidget();
        midget.addToContainer(context.globalContainer);

        context.createNewMidget();

        let position = this.getLowestPoint();
        midget.changePosition(position.x, -midget.getHeight());
        midget.changeArms3();

        await midget.fall(context, position.y - 55);
        
        midget.removeFromContainer(context.globalContainer);
        if (this.getLength() > 0) {
            this.getLast().chainAnother(midget);
            midget.changeArms2();
        }
        else {
            midget.addToDoubleContainer(this.getBackContainer(), this.getFrontContainer());
            midget.changePosition(0, 0);
            midget.changeArms1();
            midget.changeArmsAngle(this.getAngle());
        }
        midget.addClickCallback(() => this.onAddMidget(context));

        this.midgets.push(midget);
        this.size += midget.getHeight() - 55;
        this.weight += midget.getWeight();

        let cleared = this.checkLastThree();
        
        this.pole.calculateAngle();
        this.pole.updateRotation(context);

        if (cleared != null)
            this.clearMidgets(cleared, context);
        
        context.updateSlider();
        context.swing.showAgain(context);

        this.pole.removeArrows(context);
    }

    checkLastThree() {
        let length = this.getLength();
        if (length >= 3) {
            let lastMidget1 = this.midgets[length - 1];
            let lastMidget2 = this.midgets[length - 2];
            let lastMidget3 = this.midgets[length - 3];

            if (lastMidget1.getColor() == lastMidget2.getColor() && lastMidget2.getColor() == lastMidget3.getColor()) {
                let removed = this.midgets.splice(-3, 3);
                let removedWeight = lastMidget1.getWeight() + lastMidget2.getWeight() + lastMidget3.getWeight();
                let removedSize = lastMidget1.getHeight() + lastMidget2.getHeight() + lastMidget3.getHeight() - 3 * 55;
                
                this.weight -= removedWeight;
                this.size -= removedSize;

                return removed;
            } else
                return null;
        } else
            return null;
    }

    clearMidgets(cleared, context) {
        cleared[1].unchainAnother(cleared[0]);
        cleared[2].unchainAnother(cleared[1]);
        if (this.getLast() != null)
            this.getLast().unchainAnother(cleared[2]);
        else
            cleared[2].removeFromDoubleContainer(this.backContainer, this.frontContainer);

        let position = cleared[0].getGlobalPosition();
        this.pole.emitter.explode(30, position.x + cleared[0].getWidth() / 2, position.y + cleared[0].getHeight() / 2);

        let score = 0;
        for (let i = 0; i < 3; i++) {
            position = cleared[i].getGlobalPosition(context.getScrollY());
            cleared[i].addToContainerAt(context.globalContainer, position.x, position.y);
            cleared[i].changeBodyAngle(0, context);
            cleared[i].changeArmsAngle(0);
            cleared[i].changeFace2();
            cleared[i].changeArms3();
            cleared[i].fallAndHide(context, ART_HEIGHT - context.getScrollY() + i * cleared[i].getHeight());

            if (cleared[i].getType() == Midget.NORMAL)
                context.midgetPool.push(cleared[i]);
            else
                context.bigMidgetPool.push(cleared[i]);
            score += cleared[i].getWeight();
        }
        context.addScore(score);
    }

    getBackContainer() {
        return this.backContainer;
    }

    getFrontContainer() {
        return this.frontContainer;
    }

    getPosition() {
        return this.position;
    }

    getAngle() {
        return this.angle;
    }

    getWeight() {
        return this.weight;
    }

    getLength() {
        return this.midgets.length;
    }

    getSize() {
        return this.size;
    }

    getFirst() {
        return this.midgets[0];
    }

    getLast() {
        return this.midgets[this.getLength() - 1];
    }

    getGlobalPosition(scrollY = 0) {
        let position = getGlobalPosition(this.backContainer);
        position.y -= scrollY;
        return position;
    }

    getLowestPoint(scrollY = 0) {
        let lastMidget = this.getLast();
        let position;
        if (lastMidget) {
            position = lastMidget.getGlobalPosition(scrollY);
            position.y += lastMidget.getHeight();
        }
        else
            position = this.getGlobalPosition(scrollY);
        return position;  
    }
}

export default Slot;