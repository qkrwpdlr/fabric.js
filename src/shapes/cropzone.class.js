(function (global) {
    var fabric = global.fabric || (global.fabric = { }),

    if (fabric.Object) {
        return;
      }
    
    /**
     * cropzone class
     * @class fabric.cropzone
     * @extends fabric.Rect
     */
    export let cropzone = fabric.util.createClass(fabric.Rect, {
        /**
         * @type String
         */
        type: "cropzone",
        /**
         * @type Object
         */
        targetImage: Object,

        virtualTarget: {
            centerX: Number,
            centerY: Number,
            x: Number,
            y: Number,
            angle: Number,
        },
        virtualCropZone: {
            x: Number,
            y: Number,
        },
        tempScale: {
            x_left: Number,
            y_top: Number,
            x_right: Number,
            y_bottom: Number,
        },
        fill: 'rgba(0,0,0,0.4)',

        stroke: 'rgba(0,0,0,0.3)',

        /**
         * @param {Object} options fabric rect option
         */
        initialize: function (options) {
            this.targetImage = canvas.getActiveObject()
            this.callSuper('initialize', option || {
                fill: 'rgba(0,0,0,0.4)',
                stroke: 'rgba(0,0,0,0.3)',
                visible: true,
                selectable: true,
            })
            this.angle = this.targetImage.get('angle')
            this.width = this.targetImage.get('width') * this.targetImage.get('scaleX')
            this.height = this.targetImage.get('height') * this.targetImage.get('scaleY')
            this.left = this.targetImage.get('left')
            this.top = this.targetImage.get('top')
            this.setControlsVisibility({
                mtr: false
            })
            this.on({
                "moving": () => {
                    this._updateVirtual()
                    let newCropX = this.virtualCropZone.x
                    let newCropY = this.virtualCropZone.y
                    let active = false
                    if (this.virtualCropZone.x < this.virtualTarget.x) {
                        newCropX = this.virtualTarget.x
                        active = true
                        //x_left
                    }
                    if (this.virtualCropZone.y < this.virtualTarget.y) {
                        newCropY = this.virtualTarget.y
                        active = true
                        //y_top
                    }
                    if (this.virtualCropZone.x + this.get('width') * this.get('scaleX') > this.virtualTarget.x + this.targetImage.get('width') * this.targetImage.get('scaleX')) {
                        newCropX = this.virtualTarget.x + this.targetImage.get('width') * this.targetImage.get('scaleX') - this.get('width') * this.get('scaleX')
                        active = true
                        //x_right
                    }
                    if (this.virtualCropZone.y + this.get('height') * this.get('scaleY') > this.virtualTarget.y + this.targetImage.get('height') * this.targetImage.get('scaleY')) {
                        newCropY = this.virtualTarget.y + this.targetImage.get('height') * this.targetImage.get('scaleY') - this.get('height') * this.get('scaleY')
                        active = true
                        //y_bottom
                    }
                    if (active == false)
                        return
                    let goodPoint = new fabric.util.rotatePoint(new fabric.Point(newCropX, newCropY), new fabric.Point(this.virtualTarget.centerX, this.virtualTarget.centerY), this.virtualTarget.angle)
                    this.top = goodPoint.y
                    this.left = goodPoint.x
                    this.canvas.renderAll()
                    active = false

                },
                'mousedown': () => {
                    this._updateVirtual()
                    this.tempScale.x_left = (this.virtualCropZone.x - this.virtualTarget.x + this.get('width') * this.get('scaleX')) / this.get('width')
                    this.tempScale.y_top = (this.virtualCropZone.y - this.virtualTarget.y + this.get('height') * this.get('scaleY')) / this.get('height')
                },
                'scaling': () => {
                    this._updateVirtual()
                    let newCropX = this.virtualCropZone.x
                    let newCropY = this.virtualCropZone.y
                    let newScaleX = this.get("scaleX")
                    let newScaleY = this.get("scaleY")
                    let active = false
                    if (this.virtualCropZone.x < this.virtualTarget.x) {
                        newCropX = this.virtualTarget.x
                        newScaleX = this.tempScale.x_left
                        active = true
                        //x_left
                    }
                    if (this.virtualCropZone.y < this.virtualTarget.y) {
                        newCropY = this.virtualTarget.y
                        newScaleY = this.tempScale.y_top
                        active = true
                        //y_top
                    }
                    if (this.virtualCropZone.x + this.get('width') * this.get('scaleX') > this.virtualTarget.x + this.targetImage.get('width') * this.targetImage.get('scaleX')) {
                        newScaleX = (this.targetImage.get('width') * this.targetImage.get('scaleX') - (this.virtualCropZone.x - this.virtualTarget.x)) / this.get('width')
                        active = true
                        //x_right
                    }
                    if (this.virtualCropZone.y + this.get('height') * this.get('scaleY') > this.virtualTarget.y + this.targetImage.get('height') * this.targetImage.get('scaleY')) {
                        newScaleY = (this.targetImage.get('height') * this.targetImage.get('scaleY') - (this.virtualCropZone.y - this.virtualTarget.y)) / this.get('height')
                        active = true
                        //y_bottom
                    }
                    if (active == false)
                        return
                    let goodPoint = new fabric.util.rotatePoint(new fabric.Point(newCropX, newCropY), new fabric.Point(this.virtualTarget.centerX, this.virtualTarget.centerY), this.virtualTarget.angle)
                    this.top = goodPoint.y
                    this.left = goodPoint.x
                    this.scaleX = newScaleX
                    this.scaleY = newScaleY
                    active = false
                },

            })
            /**
             * this part make targetImaget to uncrop
             */
            let originAngle = fabric.util.degreesToRadians(Number(this.get('angle')))
            let x = this.targetImage.get("left") - this.targetImage.get("cropX") * this.targetImage.get("scaleX")
            let y = this.targetImage.get("top") - this.targetImage.get("cropY") * this.targetImage.get("scaleY")
            let newPoint = new fabric.util.rotatePoint(new fabric.Point(x, y), new fabric.Point(this.targetImage.get("left"), this.targetImage.get("top")), originAngle)
            this.targetImage.set({
                "height": this.targetImage._originalElement.height,
                "width": this.targetImage._originalElement.width,
                "left": newPoint.x,
                "top": newPoint.y,
                "cropX": 0,
                "cropY": 0,
            })
            this.targetImage.setCoords()
        },
        /**
         * @private
         */
        _updateVirtual: function () {
            this.virtualTarget.angle = fabric.util.degreesToRadians(Number(this.targetImage.get('angle')))
            this.virtualTarget.centerX = (this.targetImage.get('aCoords')["bl"]["x"] + this.targetImage.get('aCoords')["tr"]["x"]) / 2
            this.virtualTarget.centerY = (this.targetImage.get('aCoords')["bl"]["y"] + this.targetImage.get('aCoords')["tr"]["y"]) / 2
            let newPoint = new fabric.util.rotatePoint(new fabric.Point(this.get('left'), this.get('top')), new fabric.Point(this.virtualTarget.centerX, this.virtualTarget.centerY), this.virtualTarget.angle * -1)
            this.virtualTarget.x = this.virtualTarget.centerX - this.targetImage.get("scaleX") * this.targetImage.get('width') / 2
            this.virtualTarget.y = this.virtualTarget.centerY - this.targetImage.get("scaleY") * this.targetImage.get('height') / 2
            this.virtualCropZone.x = newPoint.x
            this.virtualCropZone.y = newPoint.y
        },
        crop: function () {
            this._updateVirtual()
            this.targetImage.set({
                cropY: (this.virtualCropZone.y - this.virtualTarget.y) / this.targetImage.get("scaleY"),
                cropX: (this.virtualCropZone.x - this.virtualTarget.x) / this.targetImage.get("scaleX"),
                height: this.get("height") * this.get("scaleY") / this.targetImage.get("scaleY"),
                width: this.get("width") * this.get("scaleX") / this.targetImage.get("scaleX"),
                top: this.virtualCropZone.y,
                left: this.virtualCropZone.x,
                angle: 0,
            })
            this.targetImage.set({
                angle: this.get('angle'),
                left: this.get('left'),
                top: this.get('top'),
            })
            this.canvas.remove(this)
        }
    });
})(typeof exports !== 'undefined' ? exports : this);