//  下拉滑动组件封装
var touchpage = function (options) {
    this.threshold = 10; // 阈值
    this.maxbottom = 15;  // 最底部滑动多少距离标识可以滑动了
    this.bindElement = null; // 绑定事件的元素
    this.upElement = null;  // 第一屏元素
    this.dowmElement = null; // 第二屏元素
    this.isLock = false;  // 是否锁住滚动
    this.distY = 0; // 滑动距离
    this._pageY = 0; // 手势按下的时候的坐标
    this.upLock = false;    // 向上滑动是否锁住
    this.downLock = true;  // 向下滑动是否锁住
    this.moveDist = 60; // 两个坐标点的移动距离
    this.isstart = false; // 只能用鼠标事件时，判断是否已经按下鼠标了
    this.$good = null;   // 滚动元素
    this.downCallback = function () { };
    this.loopBackCallback = function () { };
    this.loopDownCallback = function () { };
    this.showmoreCallback = function () { };
    this.loopshowMoreCallback = function () { };
    this.timeoutCallback = function () { };
}

// 判断第一屏是否滚动到底部了？
touchpage.prototype.isScrBottom = function () {
    var isbottom = false;
    var offsetY = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;
    var winHeight = window.innerHeight || document.body.clientHeight;
    var scrHeight = document.body.scrollHeight || document.documentElement.scrollHeight;
    var factor = Math.abs(scrHeight - winHeight - offsetY);
    if (factor >= 0 && factor <= this.maxbottom) {
        isbottom = true;
    }
    return isbottom;
};

// 初始化组件
touchpage.prototype.init = function () {
    var self = this;
    var isSupport = "ontouchstart" in document ? true : false;
    document.getElementById(this.bindElement).addEventListener(isSupport ? "touchstart" : "mousedown", function (e) {
        self._pageY = e.pageY || e.touches[0].pageY;
        self.lstpageY = self._pageY;
        self.isstart = true;
    }, false);
    document.getElementById(this.bindElement).addEventListener(isSupport ? "touchmove" : "mousemove", function (e) {
        if (!isSupport) {
            if (!self.isstart) return;
        }
        self.lstpageY = e.pageY || e.touches[0].pageY;
        if (self.isScrBottom() && self.lstpageY - self._pageY < -self.threshold) {

        }
    }, false);
    document.getElementById(this.bindElement).addEventListener(isSupport ? "touchend" : "mouseup", function (e) {
        var _dist = self.lstpageY - self._pageY;
        var isup = _dist < 0 ? true : false;
        var lastdist = Math.abs(self.lstpageY - self._pageY);
        self.isstart = false;
        if (self.upLock) {// 如果底部更多显示了
            if (!isup) { // 手是否是向下滑动的，如果是
                // 滚动的部分必须是小于10况且向下滑动，开始和结束的手势的坐标距离必须是60以上
                if ((window.pageYOffset || window.scrollY) < self.threshold) {
                    if (lastdist <= 5 && lastdist >= 0) {
                        return;
                    }
                    self.setElemCss(0);
                    self.downCallback();
                    setTimeout(function () {
                        self.showmore(false);
                        self.upLock = false;
                        self.timeoutCallback();
                    }, 1024);
                } else {
                    self.setElemCss(self.upElement.clientHeight);
                    self.loopBackCallback();
                }
            } else {
                if (!self.isScrBottom()) {
                    self.setdefTransform();
                    self.loopDownCallback();
                    // $(".btm_arrow").find(".img_arrow").removeClass("clicked");
                    // $(".btm_arrow span").text("上滑查看详情");
                    // $(".wel_btm_com").hide();
                    return;
                }
                if (lastdist >= self.moveDist) { //显示更多内容
                    if (isup && !self.upLock) {
                        self.setElemCss(self.upElement.clientHeight);
                        self.showmore(true);
                        self.showmoreCallback();
                    }
                } else {
                    if (!self.upLock) { // 如果info这个更多信息没有显示，说明滑动没有效果
                        self.setdefTransform();
                        self.showmore(false);
                        self.loopshowMoreCallback();
                    }
                }
            }
        }
    }, false);
}

// 设置滑动的距离
touchpage.prototype.setMainTransform = function (event, pageY, noLockCallback, lockCallback) {
    event.preventDefault();
    var dist = Math.abs(pageY - this._pageY);
    var transfLen = 200 / window.innerHeight * dist;
    var _height = this.upElement.clientHeight;
    if (this.upLock) {
        transfLen = _height - transfLen;
    }
    this.setElemCss(transfLen);
    if (this.dist >= this.moveDist) {
        if (!this.upLock) {
            noLockCallback && noLockCallback();
        } else {
            lockCallback && lockCallback();
        }
    }
}

touchpage.prototype.setElemCss = function (transf, trans) {
    this.$good.css({
        "transition": trans || "transform 1s cubic-bezier(0, 0, 0.25, 1) 0ms",
        "transform": "translateY(-{0}px) translateZ(0)".replace("{0}", transf),
        "-webkit-transition": trans || "-webkit-transform 1s cubic-bezier(0, 0, 0.25, 1) 0ms",
        "-webkit-transform": "translateY(-{0}px) translateZ(0)".replace("{0}", transf)
    });
}

touchpage.prototype.setdefTransform = function () {
    this.setElemCss(0, "none");
}

// 显示第二屏，或者隐藏第二屏
touchpage.prototype.showmore = function (isshow, showCallback, hideCallback) {
    var _height = this.upElement.clientHeight;
    if (isshow) {
        showCallback && showCallback();
        this.$good.style.marginBottom = _height + "px";
        this.upLock = true; // 表示向上拖动之后，成功添加了更多信息
        setTimeout(function () {
            window.scrollTo(0, 0);
        }, 10);
    } else {
        hideCallback && hideCallback();
        this.$good.style.marginBottom = 0;
        this.setdefTransform();
    }
}