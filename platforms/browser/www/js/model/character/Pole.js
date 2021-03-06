import { changeContainerOrigin, TILT_DURATION } from '../../Utils';
import LeftSlot1 from './slots/LeftSlot1';
import LeftSlot2 from './slots/LeftSlot2';
import LeftSlot3 from './slots/LeftSlot3';
import LeftSlot4 from './slots/LeftSlot4';
import RightSlot1 from './slots/RightSlot1';
import RightSlot2 from './slots/RightSlot2';
import RightSlot3 from './slots/RightSlot3';
import RightSlot4 from './slots/RightSlot4';

const D = 130;
const L = [383, 602, 814, 1015];
const CHARACTER_FORCE = 5000;

const FIRST_ANGLE = 0.05;
const SECOND_ANGLE = 0.2;
const LAST_ANGLE = 0.5;

const FIRST_FACE_ANGLE = 0.2;
const SECOND_FACE_ANGLE = 0.4;

class Pole {
    constructor(character) {
        this.slots = [];

        this.slots.push(new LeftSlot1(this));
        this.slots.push(new LeftSlot2(this));
        this.slots.push(new LeftSlot3(this));
        this.slots.push(new LeftSlot4(this));
        
        this.slots.push(new RightSlot1(this));
        this.slots.push(new RightSlot2(this));
        this.slots.push(new RightSlot3(this));
        this.slots.push(new RightSlot4(this));

        this.angle = 0;

        this.origin = {
            x: 0,
            y: 0
        };

        this.character = character;
        this.arrowsVisible = true;
    }

    createArms(context, parentContainer) {
        this.twinArmsCont = context.add.container(0, 380);
        this.armsCont = context.add.container(0, 0);
        this.arms = context.add.image(993, 0, 'arms').setOrigin(0);
        this.armsCont.add(this.arms);
        this.twinArmsCont.add(this.armsCont);
        parentContainer.add(this.twinArmsCont);
        changeContainerOrigin(this.armsCont, { x: 1141, y: 0 });
        changeContainerOrigin(this.twinArmsCont, { x: 1141, y: 0 });
    }

    createPole(context, parentContainer) {
        this.createEmitter(context);

        this.twinPoleCont = context.add.container(0, 380);
        this.poleCont = context.add.container(0, 0);
        this.pole = context.add.image(0, 93, 'pole').setOrigin(0);
        this.poleCont.add(this.pole);
        this.twinPoleCont.add(this.poleCont);
        parentContainer.add(this.twinPoleCont);
        this.createSlots(context, this.poleCont);

        changeContainerOrigin(this.poleCont, { x: 1141, y: 0 });
        changeContainerOrigin(this.twinPoleCont, { x: 1141, y: 0 });

        this.origin = {
            x: 1141,
            y: 0
        };
    }

    createSlots(context, parentContainer) {
        for (let slot of this.slots) {
            slot.createContainer(context, parentContainer);
            slot.createArrow(context);
        }
    }

    createEmitter(context) {
        this.particles = context.add.particles('star');
        this.emitter = this.particles.createEmitter({
            frame: [0, 1, 2, 3],
            lifespan: 1000,
            speed: {
                min: 100,
                max: 400
            },
            alpha: {
                start: 1,
                end: 0,
                ease: 'Sine.InOut'
            },
            rotate: {
                start: 0,
                end: 360,
                ease: 'Sine.InOut'
            },
            frequency: -1,
            blendMode: 'ADD'
        });
        context.particlesContainer.add(this.particles);
    }

    removeArrows(context) {
        if (this.arrowsVisible) {
            let arrows = [];
            for (let slot of this.slots)
                arrows.push(slot.arrow);
            context.tweens.add({
                targets: arrows,
                alpha: 0,
                duration: 2000,
                ease: 'Sine.InOut',
                onComplete: () => {
                    for (let slot of this.slots) {
                        slot.arrow.destroy();
                        slot.arrow = null;
                    }
                    context.textures.remove('arrow');
                }
            });
            this.arrowsVisible = false;
        }
    }

    calculateAngle() {
        let leftTorque = 0, rightTorque = 0, weightSum = 0;

        for (let i = 0; i < 4; i++) {
            let weight = this.slots[i].getWeight();
            leftTorque += weight * L[i];
            weightSum += weight;
        }
        for (let i = 4; i < 8; i++) {
            let weight = this.slots[i].getWeight();
            rightTorque += weight * L[i - 4];
            weightSum += weight;
        }

        let value = (rightTorque - leftTorque) / (D * (CHARACTER_FORCE - weightSum));
        this.angle = Math.atan(value);
    }

    updateRotation(context) {
        let poleAngle = this.angle;
        let torsoAngle = 0;
        let bodyAngle = 0;

        let sign = poleAngle < 0 ? -1 : 1;
        let absolutePoleAngle = Math.abs(poleAngle);

        if (absolutePoleAngle > FIRST_ANGLE) {
            if (absolutePoleAngle > SECOND_ANGLE) {
                poleAngle = sign * FIRST_ANGLE;
                torsoAngle = sign * SECOND_ANGLE;
                bodyAngle = sign * (Math.abs(this.angle) - SECOND_ANGLE);
            } else {
                poleAngle = sign * FIRST_ANGLE;
                torsoAngle = sign * (Math.abs(this.angle) - FIRST_ANGLE);
            }
        }

        if (absolutePoleAngle > FIRST_FACE_ANGLE) {
            if (absolutePoleAngle > SECOND_FACE_ANGLE)
                this.character.changeMouth3();
            else
                this.character.changeMouth2();
        } else
            this.character.changeMouth1();

        context.tweens.add({
            targets: [this.twinPoleCont, this.twinArmsCont],
            rotation: poleAngle,
            duration: TILT_DURATION,
            ease: 'Elastic',
            easeParams: [1.5, 0.3]
        });

        context.tweens.add({
            targets: this.character.twinTorsoCont,
            rotation: torsoAngle,
            duration: TILT_DURATION,
            ease: 'Elastic',
            easeParams: [1.0, 0.3]
        });

        context.tweens.add({
            targets: this.character.twinContainer,
            rotation: bodyAngle,
            duration: TILT_DURATION,
            ease: 'Elastic',
            easeParams: [1.0, 0.3]
        });

        for (let slot of this.slots) {
            if (slot.getLength() > 0)
                slot.getFirst().changeBodyAngle(-this.angle, context);
        }
    }

    getLowestPoint(scrollY = 0) {
        let max = 0;
        for (let slot of this.slots) {
            let y = slot.getLowestPoint(scrollY).y;
            if (y > max)
                max = y;
        }
        return max;
    }
}

export default Pole;