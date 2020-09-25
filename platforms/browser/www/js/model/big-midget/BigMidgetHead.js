import MidgetHead from '../midget/MidgetHead';

class BigMidgetHead extends MidgetHead {
    createHat(context, parentContainer) {
        this.hatCont = context.add.container(16, 6);
        this.hat = context.add.image(0, 0, 'midget-big-hat').setOrigin(0);
        this.hatCont.add(this.hat);
        parentContainer.add(this.hatCont);
    }

    createHead(context, parentContainer) {
        this.headCont = context.add.container(16, 6);
        this.faceCont = context.add.container(80, 30);
        this.head = context.add.image(0, 18, 'midget-big-head').setOrigin(0);
        this.face = context.add.image(16, 32, 'midget-big-face').setOrigin(0);
        this.bow = context.add.image(50, 0, 'midget-big-bow').setOrigin(0);
        this.faceCont.add([this.head, this.face, this.bow]);
        this.headCont.add(this.faceCont);
        parentContainer.add(this.headCont);
    }

    applyColorFilter(filterName) {
        super.applyColorFilter(filterName);
        this.bow.setPipeline(filterName);
    }
}

export default BigMidgetHead;