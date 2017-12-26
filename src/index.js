import './index.scss';

let width = window.innerWidth,
    height = window.innerHeight,
    game = new Phaser.Game(width, height, Phaser.AUTO, "#game");//创建游戏实例

//定义场景
let states = {

    //每个场景都有自己的生命周期，常用的生命周期是preload预加载，create准备就绪，update更新周期 render渲染完成
    //


    //加载场景
    preload: function() {

        

        this.preload = function(){
             //设置背景颜色为黑色
            game.stage.backgroundColor = "#000000";

            //加载游戏中需要的资源
            game.load.image('bg', "./img/bg.png");
            game.load.image('bomb', "./img/bomb.png");
            game.load.image('dude', "./img/dude.png");
            game.load.image('five', "./img/five.png");
            game.load.image('one', "./img/one.png");
            game.load.image('green', "./img/green.png");
            game.load.image('red', "./img/red.png");
            game.load.image('yellow', "./img/yellow.png");
            game.load.image('three', "./img/three.png");
            game.load.image('reset', "./img/reset.png");
            game.load.image('start', "./img/start.png");
            game.load.audio('addscore', "./audio/addscore.mp3");
            game.load.audio('bgMusic', "./audio/bgMusic.mp3");
            game.load.audio('boom', "./audio/boom.mp3");

            //添加进度文字
            let pro_text = game.add.text(game.world.centerX, game.world.centerY, '0%', {
                fontSize: "60px",
                fill: "#ffffff"
            });

            //设置锚点，居中
            pro_text.anchor.setTo(0.5, 0.5);

            //监听加载完一个文件的事件
            game.load.onFileComplete.add(function(pro) {
                pro_text.text = pro + "%";
            });


            //监听加载完成事件
            //game.load.onLoadComplete.add(on_load);
            game.load.onLoadComplete.add(function(){
                game.state.start('created');
            });

        }
    },

    //开始场景
    created: function() {

        this.create = function() {
           
            let w = game.world.width,//画布的宽
                h = game.world.height,//画布的高
                center_x = game.world.centerX,//画布的x方向的中心坐标x
                center_y = game.world.centerY;//画布的y方向的中心坐标y

             //添加背景图片
            let bg = game.add.image(0, 0, 'bg');
            bg.width = w;
            bg.height = h;

            //添加标题文字
            let title_text = game.add.text(center_x, h * 0.2, "快来捡苹果啦", {
                fontSize: "40px",
                fill: "#8ab64b",
                fontWeight: "700"
            });

            title_text.anchor.setTo(0.5, 0.5);


            //添加人物
            let man = game.add.sprite(center_x, h * 0.8, 'dude'),
                man_image = game.cache.getImage('dude');
            man.width = w * 0.2;
            man.height = man.width / man_image.width * man_image.height;

            man.anchor.setTo(0.5, 0.5);

            //添加点击事件
            // game.input.onTap.add(function() {
            //     game.state.start('play');
            // });

            //添加开始游戏按钮
            let start_image = game.cache.getImage('start'),
                start_button = game.add.button(center_x,center_y,'start',function(){
                    game.state.start('play');
                });
            start_button.width = w*0.4;
            start_button.height = start_button.width*start_image.height/start_image.width;
            start_button.anchor.setTo(0.5, 0.5);
        }
    },
    //游戏场景
    play: function() {

        let man, apples, apple, score,
            score_text, addscore_music, boom_music, bgMusic;


        this.create = function() {

            score = 0; //初始化分数是0

            //开启物理引擎
            game.physics.startSystem(Phaser.Physics.Arcade);
            game.physics.arcade.gravity.y = 300;

            bgMusic = game.add.audio('bgMusic');
            bgMusic.loopFull(); //播放背景音乐

            addscore_music = game.add.audio('addscore');
            boom_music = game.add.audio('boom');



            ////添加背景图片
            let w = game.world.width,
                h = game.world.height,
                center_x = game.world.centerX,
                center_y = game.world.centerY;

            let bg = game.add.image(0, 0, 'bg');
            bg.width = w;
            bg.height = h;


            //添加人物
            man = game.add.sprite(center_x, h * 0.8, 'dude');
            let man_image = game.cache.getImage('dude');
            man.width = w * 0.2;
            man.height = man.width / man_image.width * man_image.height;

            man.anchor.setTo(0.5, 0.5);

            //加入物理运动
            game.physics.enable(man);
            //消除重力影响,不会掉下去的
            man.body.allowGravity = false;

            //添加分数
            score_text = game.add.text(center_x, h * 0.25, "0", {
                fontSize: "30px",
                fill: "#8ab64b",
                fontWeight: "700"
            });

            score_text.anchor.setTo(0.5, 0.5);


            let touching = false; //是否是在触摸的状态标识，默认是不在触摸状态

            //监听按下事件
            game.input.onDown.add(function(pointer) { //按下
                // 要判断是否点住主角才可以拖动左右移动，避免瞬移
                // 否则会出现手指按到一个位置，人物瞬间会移动到某位置，影响体验
                if (Math.abs(pointer.x - man.x) < man.width / 2) {
                    touching = true;
                }

            });

             //监听离开事件
            game.input.onUp.add(function() { //离开
                touching = false;
            });

            //监听滑动事件
            //第四个参数非常有用，可以判断是否为点击事件，如果是点击就不移动主角。
            game.input.addMoveCallback(function(pointer, x, y, isTap) { //滑动
                if (!isTap && touching) {
                    man.x = x;
                }
            });

            //添加苹果组
            apples = game.add.group();

            let apples_types = ['green', 'red', 'yellow', 'bomb'];
                //apples_time = game.time.create(true);

            //下面这两种写法都可以
            //apples_time.loop(1000, function() {
            game.time.events.loop(1000, function() {

                let x = Math.random() * w,
                    type = apples_types[Math.floor(Math.random() * apples_types.length)];



                apple = apples.create(x, 0, type);



                //设置苹果大小

                let apple_image = game.cache.getImage(type);
                apple.width = w * 0.125;
                apple.height = apple.width / apple_image.width * apple_image.height;

                //设置苹果加入运动
                game.physics.enable(apple);

                //设置苹果如果与下边缘碰撞，则表示游戏结束
                //开启苹果和边缘碰撞
                apple.body.collideWorldBounds = true; 
                //开启了collideWorldBounds并且接触到场景边缘时，将触发Signal的事件
                //首先初始化一个默认的信号，初始化之后为空，然后给他添加监听事件
                apple.body.onWorldBounds = new Phaser.Signal();
                apple.body.onWorldBounds.add(function(apple, up, down, left, right) {
                    if (down) {
                        apple.kill();
                        if (type !== "bomb") {
                            //炸弹音乐播放
                            boom_music.play();
                            //北京音乐关闭
                            bgMusic.destroy();
                            //进入结束场景，并且把分数带过去
                            game.state.start('over', true, false, score);

                        }
                    }
                })

            });
            //apples_time.start();

        }


        this.update = function() {
            game.physics.arcade.overlap(man, apples, pick, null, this); //监听接触事件
        }

        //接触事件
        function pick(man, apple) {

            if (apple.key === "bomb") {

                boom_music.play();
                bgMusic.destroy();
                //game.cache.removeSound('bgMusic');//移除了音乐，下次点击的时候加载不上来了
                //进入结束场景，并且把分数带过去，score会传入结束场景的init生命周期中
                game.state.start('over', true, false, score);

            } else {
                console.log(apple);



                let points = {
                    _red: {
                        point: 1,
                        img: "one"
                    },
                    _yellow: {
                        point: 3,
                        img: "three"
                    },
                    _green: {
                        point: 5,
                        img: "five"
                    }
                };

                let apple_type = points['_' + apple.key],
                    point = apple_type.point,
                    point_img = apple_type.img;

                //添加得分的图片
                let goal = game.add.image(apple.x, apple.y, point_img),
                    goal_img = game.cache.getImage(point_img);

                goal.width = apple.width;
                goal.height = apple.width / goal_img.width * goal_img.height;
                goal.alpha = 0;
                //添加过度效果
                let show_tween = game.add.tween(goal).to({
                    alpha: 1,
                    y: goal.y - 20
                }, 100, Phaser.Easing.Linear.None, true, 0, 0, false);

                show_tween.onComplete.add(function() {
                    let hiden_tween = game.add.tween(goal).to({
                        alpha: 0,
                        y: goal.y - 20
                    }, 100, Phaser.Easing.Linear.None, true, 200, 0, false);
                    hiden_tween.onComplete.add(function() {
                        goal.kill();
                    })
                })



                //清除苹果
                apple.kill();
                score += point;
                score_text.text = score;
                addscore_music.play();
            }
        }



    },
    //结束场景
    over: function() {

        let score = 0;
        this.init = function() {
            score = arguments[0];
            console.log(score);
        }

        this.create = function() {
            
            let w = game.world.width,
                h = game.world.height,
                center_x = game.world.centerX,
                center_y = game.world.centerY;


            //添加背景图片
            let bg = game.add.image(0, 0, 'bg');
            bg.width = w;
            bg.height = h;

            //添加结束的标题
            let over_text = game.add.text(center_x, h * 0.25, "OVER", {
                fontSize: "30px",
                fill: "#8ab64b",
                fontWeight: "700"
            });

            over_text.anchor.setTo(0.5, 0.5);

            //添加分数

            let score_val = "得分：" + score;

            let score_text = game.add.text(center_x, h * 0.4, score_val, {
                fontSize: "30px",
                fill: "#8ab64b",
                fontWeight: "700"
            });

            score_text.anchor.setTo(0.5, 0.5);


             //添加重置游戏按钮
            let reset_image = game.cache.getImage('reset'),
                reset_button = game.add.button(center_x,center_y,'reset',function(){
                    game.state.start('play');
                });
            reset_button.width = w*0.4;
            reset_button.height = reset_button.width*reset_image.height/reset_image.width;
            reset_button.anchor.setTo(0.5, 0.5);

        }

    }
}


// 添加场景到游戏示例中
Object.keys(states).map(function(key) {
    game.state.add(key, states[key]);
});

// 启动游戏
game.state.start('preload');