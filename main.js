cc.game.onStart = function(){
    cc.view.adjustViewPort(true);

    cc.view.setDesignResolutionSize(640, 960,
        (document.body.clientWidth>document.body.clientHeight ? 
        cc.ResolutionPolicy.FIXED_HEIGHT : cc.ResolutionPolicy.FIXED_WIDTH));

    cc.view.resizeWithBrowserSize(true);
    //load resources
    cc.LoaderScene.preload(g_resources, function () {
        cc.director.runScene(new MainScene());
    }, this);
};
cc.game.run();
