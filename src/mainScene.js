var blink=function(ref,data){
    if(data)
        document.getElementById('blink').style.display="block";
    else
        document.getElementById('blink').style.display="none";
};
var MainScene = cc.Scene.extend({
    buttons:[],
    arrows:[],
    scoreTxt:null,
    timeLen:null,

    lose:null,
    scoreLose:null,
    comment:null,
    againButton:null,
    shareButton:null,

    //游戏数值
    last:-1,//上一个方向，为-1表示游戏未开始
    score:0,
    timeAll:60,//暂定60秒
    time:0,
    timeP:1,//每对一个加1秒
    timeS:-5,//每错一个减5秒

    onEnter:function () {
        this._super();
        var layer = ccs.load(res.layer_json).node;
        var layerColor=cc.LayerColor.create(cc.color(210,210,210));
        layerColor.addChild(layer);
        this.addChild(layerColor);

        this.getData(layer);
        this.reset();
    },

    setTime:function(timePlus){
    	this.time+=timePlus;
    	this.timeLen.setPercent(this.time/this.timeAll*100);
    	this.timeLen.setColor(this.colors[Math.max(0,Math.min(3, Math.floor(this.time/this.timeAll*4)))]);
    },

    running:function(dt){
    	if(this.time<=0){//输了
    		this.isRunning=false;
    		this.unschedule(this.running);

    		this.lose.setVisible(true);
    		this.scoreLose.setString("你获得了"+this.score+"分");

    		var level=Math.floor(this.score/10);
    		var ran=Math.min(Math.floor(Math.random() * this.comments[level].length),this.comments.length);
    		this.comment.setString(this.comments[level][ran]);
    		this.comment.setFontSize(384/this.comments[level][ran].length);
    	}
    	else{
    		this.setTime(-dt);//每dt执行一次，减少时间条
    	}
    },

    getData:function(root){
        for(var row=0;row<4;++row){
            for(var col=0;col<4;++col){
                var index = row*4+col;
                this.buttons[index] = ccui.helper.seekWidgetByName(root, "button_"+row+"_"+col);
                this.buttons[index].addTouchEventListener(this.clickButton,this);
                this.buttons[index].userData=index;
                this.arrows[index] = ccui.helper.seekWidgetByName(this.buttons[index], "arrow");
            }
        }

        var titleThings=ccui.helper.seekWidgetByName(root, "titleThings");
        this.scoreTxt=ccui.helper.seekWidgetByName(titleThings, "score");
        this.timeLen=ccui.helper.seekWidgetByName(titleThings, "time");
        this.timeLen.setRotation(180);

        this.lose=ccui.helper.seekWidgetByName(root, "loseThings");
        this.scoreLose=ccui.helper.seekWidgetByName(this.lose, "score");
        this.comment=ccui.helper.seekWidgetByName(this.lose, "comment");
        this.againButton=ccui.helper.seekWidgetByName(this.lose, "againButton");
        this.againButton.addTouchEventListener(this.clickReset,this);

        this.shareButton=ccui.helper.seekWidgetByName(this.lose, "shareButton");
        this.shareButton.addClickEventListener(this.clickShare);
    },

	clickShare:function(ref){
		document.getElementById('mcover').style.display='block';
	},

    clickButton:function(ref,type){
    	if(type== ccui.Widget.TOUCH_BEGAN){
    		var index=ref.userData;//点击该按钮，记下该按钮

        	if(this.last==-1){//游戏未开始
        		this.schedule(this.running,0.01);
        		this.isRunning=true;
        	}else{
        		//游戏已经开始，则判断last与当前按钮是否符合，符合则加时间,不符合则扣时间并不改变当前按钮
        		if(this.last==index){//点对了
        			this.setTime(this.timeP);
        			this.scoreTxt.setString(""+(++this.score));
        		}
        		else{//点错了
        			this.setTime(this.timeS);
                    this.blinkAction();
        			return;
        		}
        	}

        	//将按钮所指新按钮存入last,并改变按钮方向
        	this.last=index+this.dirs_plus[this.dirs[index]];
        	this.setDir(index);
		}
    },

    blinkAction:function(){
        var blinkC1=cc.CallFunc.create(blink,this,true);
        var blinkC2=cc.CallFunc.create(blink,this,false);
        var blinkC3=cc.CallFunc.create(blink,this,true);
        var blinkC4=cc.CallFunc.create(blink,this,false);

        var blink2=cc.DelayTime.create(0.05);
        var blink3=cc.DelayTime.create(0.08);
        var blink4=cc.DelayTime.create(0.14);

        this.runAction(cc.Sequence.create(blinkC1,blink2,blinkC2,blink3,blinkC3,blink4,blinkC4));
    },

    clickReset:function(ref,type){
    	if(type== ccui.Widget.TOUCH_ENDED)
        	this.reset();
    },

    /*
            0
         7    1
       6        2 
         5    3
            4

    */
    dirs:[],
    dirs_plus:[4,5,1, -3,-4,-5, -1,3],
    dirs_pre:[
        [0,1,2],//左下0
        [6,7,0,1,2],//下1
        [6,7,0,1,2],//下2
        [6,7,0],//右下3


        [0,1,2,3,4],//左4
        [0,1,2,3,4,5,6,7],//中5
        [0,1,2,3,4,5,6,7],//中6
        [4,5,6,7,0],//右7

        [0,1,2,3,4],//左8
        [0,1,2,3,4,5,6,7],//中9
        [0,1,2,3,4,5,6,7],//中10
        [4,5,6,7,0],//右11

        [2,3,4],//左上12
        [2,3,4,5,6],//上13
        [2,3,4,5,6],//上14
        [4,5,6],//右上15
    ],

    colors:[
        cc.color(178,34,34),//红
        cc.color(255,127,0),//橙黄
        cc.color(0,255,255),//亮蓝
        cc.color(0,255,127),//翠绿
        cc.color(255,215,0),//金黄
        cc.color(176,48,96),//紫红
        cc.color(255,20,147),//深粉
        cc.color(186,85,211),//浅紫
        cc.color(34,139,34),//深绿
    ],

    comments:[
    	[
    		"生活好无聊，没事多点点",
    		"你就这点能耐了？",
    		"回去多练练再来吧！",
    		"逗bi逗bi，逗的就是你",
    		"你其实不该那么自信的",
            "一定是天太热，你才会那么慢",
            "你该检查检查视力了",
            "对不起，但你是个好人"
    	],
    	[
    		"不错不错，比蜗牛稍快点",
            "擦擦屏幕，再接再厉",
            "天色还早，咱们洗洗再来",
            "屏幕没买保险吗？怎么不敢点"
    	],
    	[
    		"我要对你另眼相看了！",
            "再点点，就可以晋级啦",
            "反应不错嘛，我看好你哦",
            "前方高能，能点才是王道"
    	],
    	[
    		"你已经超神了，快去炫耀",
    		"神挡杀神，佛挡杀佛",
    		"这手速~你懂的^_^",
    		"天哪，我居然被你打败了",
            "你就是传说中美爆六界的杀阡陌"
    	]
    ],

    setDir:function(index){
        var ran=Math.floor( Math.random() * this.dirs_pre[index].length);
        var dir = this.dirs_pre[index][ran];
        this.dirs[index]=dir;

        var color=this.colors[Math.floor( Math.random() * this.colors.length)];
        this.arrows[index].setColor(color);
        this.arrows[index].setRotation(45*dir);
    },

    reset:function(){
        //还原所有箭头方向及颜色（随机方式)
        for(var i=0; i<16 ;++i)
        	this.setDir(i);

        //还原时间及时间条
        this.time=this.timeAll;
        this.timeLen.setPercent(100);
        this.timeLen.setColor(this.colors[3]);

        //还原游戏状态 分数等
        this.last=-1;
        this.score=0;
        this.scoreTxt.setString("0");

        //消失失败面板
        this.lose.setVisible(false);
    },
});

