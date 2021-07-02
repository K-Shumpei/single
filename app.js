// モジュール
const http = require("http")
const express = require("express")
const socketIO = require("socket.io")

// オブジェクト
const app = express()
const server = http.Server(app)
const io = socketIO(server)

// 定数
const PORT = process.env.PORT || 7000

// 公開フォルダの指定
app.use(express.static(__dirname))

// サーバーの起動
server.listen(PORT, () => {
    console.log("server starts on port: %d", PORT)
})

// トレーナーネーム、ソケットID、コマンド
var data = []
var rec = []
var playerCount = 0
var roomCount = -1
var IdAndRoom = []

function room_search(socketID){
    for (const list of IdAndRoom){
        if (list[0] == socketID){
            return list[1]
        }
    }
}

// jsファイルの読み込み
const main = require("./js_script/main_process")
const summon = require("./js_script/1_summon")
const movePro = require("./js_script/4_move_effect")
const success = require("./js_script/3_move_success")
const end = require("./js_script/5_end_process")
const bfn = require("./js_script/base_function")
const efn = require("./js_script/ex_function")

// 接続時の処理
io.on("connection", function(socket){
    console.log("connection")

    // コネションが確率されたら実行
    socket.emit("connected", {})

    // パスワード受信
    socket.on("password", function(txt){
        if (txt == "11111"){
            io.to(socket.id).emit("pass", {})
        } else {
            io.to(socket.id).emit("miss", {})
        }
    })

    // チームデータ受信
    socket.on('team_data',function(name, team_data){
        
        console.log('name: ' + name);

        playerCount += 1
        if (playerCount % 2 == 1){
            roomCount += 1
        }

        IdAndRoom.push([socket.id, roomCount])

        if (playerCount % 2 == 1){
            let info = {user1: "", user2: ""}
            info.user1 = {team: team_data, poke0: "", poke1: "", poke2: "", data: "", con: ""}
            info.user2 = {team: "", poke0: "", poke1: "", poke2: "", data: "", con: ""}
            info.user1.data = {id: socket.id, command: "", mega: false, megable: true, megaTxt: "メガ進化", Z: false, Zable: true, ZTxt: "Z技", dyna: false, dynable: false, dynaTxt: "ダイマックス", giga: false, gigable: true, gigaTxt: "キョダイマックス"}
            info.user1.con = {TN: name, p_con: "", f_con: "", used: "", log: ""}
            data.push(info)
            io.to(socket.id).emit("find enemy", {})
        } else {
            data[room_search(socket.id)].user2.data = {id: socket.id, command: "", mega: false, megable: true, megaTxt: "メガ進化", Z: true, Zable: true, ZTxt: "Z技", dyna: false, dynable: false, dynaTxt: "ダイマックス", giga: false, gigable: true, gigaTxt: "キョダイマックス"}
            data[room_search(socket.id)].user2.con = {TN: name, p_con: "", f_con: "", used: "", log: ""}
            data[room_search(socket.id)].user2.team = team_data
            io.to(data[room_search(socket.id)].user1.data.id).emit("select pokemon", data[room_search(socket.id)], 1, 2)
            io.to(data[room_search(socket.id)].user2.data.id).emit("select pokemon", data[room_search(socket.id)], 2, 1)
        }

    })

    // 選出ポケモンを選んだ
    socket.on("get ready", function(select) {
        const room = room_search(socket.id)
        for (const team of [[1, 2], [2, 1]]){
            if (data[room]["user" + team[0]].data.id == socket.id){
                data[room]["user" + team[0]].poke0 = data[room]["user" + team[0]].team[select[0]]
                data[room]["user" + team[0]].poke1 = data[room]["user" + team[0]].team[select[1]]
                data[room]["user" + team[0]].poke2 = data[room]["user" + team[0]].team[select[2]]
                data[room]["user" + team[0]].poke0.num = select[0]
                data[room]["user" + team[0]].poke1.num = select[1]
                data[room]["user" + team[0]].poke2.num = select[2]
                delete data[room]["user" + team[0]].team
                data[room]["user" + team[0]].data.command = 4
                // 相手がまだの時
                if (data[room]["user" + team[1]].data.command == ""){
                    io.to(data[room]["user" + team[0]].data.id).emit("waiting me", {})
                    io.to(data[room]["user" + team[1]].data.id).emit("waiting you", {})
                } else {
                    // 相手が選んでいる時
                    main.battleStart(data[room])
                    io.to(data[room].user1.data.id).emit("run battle", data[room].user1, data[room].user2)
                    io.to(data[room].user2.data.id).emit("run battle", data[room].user2, data[room].user1)
                    data[room].user1.data.command = ""
                    data[room].user2.data.command = ""

                    //action_timer = setInterval(function() {
                      //  console.log("passed 1 second")
                    //}, 1000)
                }
            }
        }


       
    })

    // 各ターンの行動
    socket.on("action decide", function(val, opt) {
        const room = room_search(socket.id)
        let player = ""
        let enemy = ""
        if (data[room].user1.data.id == socket.id){
            data[room].user1.data.command = val
            data[room].user1.data.mega = opt.mega
            data[room].user1.data.Z = opt.Z
            data[room].user1.data.dyna = opt.dyna
            data[room].user1.data.giga = opt.giga
            player = 1
            enemy = 2
        } else if (data[room].user2.data.id == socket.id){
            data[room].user2.data.command = val
            data[room].user2.data.mega = opt.mega
            data[room].user2.data.Z = opt.Z
            data[room].user2.data.dyna = opt.dyna
            data[room].user2.data.giga = opt.giga
            player = 2
            enemy = 1
        }
        // 空欄、空欄
        if (!data[room].user1.con.f_con.includes("選択中") && !data[room].user1.con.f_con.includes("ひんし") 
        && !data[room].user2.con.f_con.includes("選択中") && !data[room].user2.con.f_con.includes("ひんし")){
            if (data[room].user1.data.command != "" && data[room].user2.data.command != ""){
                main.runBattle(data[room])
                io.to(data[room].user1.data.id).emit("run battle", data[room].user1, data[room].user2)
                io.to(data[room].user2.data.id).emit("run battle", data[room].user2, data[room].user1)
                return
            }
        }
        // 選択中、空欄
        if ((data[room].user1.con.f_con.includes("選択中") && !data[room].user2.con.f_con.includes("選択中") && !data[room].user2.con.f_con.includes("ひんし")) 
        || (data[room].user2.con.f_con.includes("選択中") && !data[room].user1.con.f_con.includes("選択中") && !data[room].user1.con.f_con.includes("ひんし"))){
            summon.pokeReplace(data[room]["user" + player], data[room]["user" + enemy])
            summon.onField(data[room]["user" + player], data[room]["user" + enemy], 1)
            data[room]["user" + player].data.command = ""
            if (data[room]["user" + enemy].data.command != ""){
                let atk = data[room]["user" + enemy]
                let def = data[room]["user" + player]
                let order = [def, atk]
                let move = success.moveSuccessJudge(atk, def, order)
                if (move == false){
                    bfn.processAtFailure(atk)
                } else {
                    if (move[9] == "反射"){
                        let save = atk
                        atk = def
                        def = save
                    }
                    if (movePro.moveProcess(atk, def, move, order) == "stop"){
                        atk.data.command = ""
                        io.to(data[room].user1.data.id).emit("run battle", data[room].user1, data[room].user2)
                        io.to(data[room].user2.data.id).emit("run battle", data[room].user2, data[room].user1)
                        return
                    }
                }
                atk.data.command = ""
            }
            end.endProcess(data[room].user1, data[room].user2)
            io.to(data[room].user1.data.id).emit("run battle", data[room].user1, data[room].user2)
            io.to(data[room].user2.data.id).emit("run battle", data[room].user2, data[room].user1)
            return
        }
        // ひんし、空欄
        if ((data[room].user1.con.f_con.includes("ひんし") && !data[room].user2.con.f_con.includes("選択中") && !data[room].user2.con.f_con.includes("ひんし")) 
        || (data[room].user2.con.f_con.includes("ひんし") && !data[room].user1.con.f_con.includes("選択中") && !data[room].user1.con.f_con.includes("ひんし"))){
            summon.pokeReplace(data[room]["user" + player], data[room]["user" + enemy])
            summon.onField(data[room]["user" + player], data[room]["user" + enemy], 1)
            data[room]["user" + player].data.command = ""
            io.to(data[room].user1.data.id).emit("run battle", data[room].user1, data[room].user2)
            io.to(data[room].user2.data.id).emit("run battle", data[room].user2, data[room].user1)
            return
        }
        // 選択中、選択中
        if (data[room].user1.con.f_con.includes("選択中") && data[room].user2.con.f_con.includes("選択中")){
            if (data[room].user1.data.command != "" && data[room].user2.data.command != ""){
                summon.pokeReplace(data[room].user1, data[room].user2)
                summon.pokeReplace(data[room].user2, data[room].user1)
                summon.onField(data[room].user1, data[room].user2, "both")
                end.endProcess(data[room].user1, data[room].user2)
                data[room].user1.data.command = ""
                data[room].user2.data.command = ""
                io.to(data[room].user1.data.id).emit("run battle", data[room].user1, data[room].user2)
                io.to(data[room].user2.data.id).emit("run battle", data[room].user2, data[room].user1)
                return
            }
        }
        // ひんし、ひんし
        if (data[room].user1.con.f_con.includes("ひんし") && data[room].user2.con.f_con.includes("ひんし")){
            if (data[room].user1.data.command != "" && data[room].user2.data.command != ""){
                summon.pokeReplace(data[room].user1, data[room].user2)
                summon.pokeReplace(data[room].user2, data[room].user1)
                summon.onField(data[room].user1, data[room].user2, "both")
                data[room].user1.data.command = ""
                data[room].user2.data.command = ""
                io.to(data[room].user1.data.id).emit("run battle", data[room].user1, data[room].user2)
                io.to(data[room].user2.data.id).emit("run battle", data[room].user2, data[room].user1)
                return
            }
        }
    })

    // 切断時の処理
    socket.on("disconnect", () => {
        const room = room_search(socket.id)
        if (room != undefined){
            if (data[room].user2 == ""){ // 対戦相手がまだ見つかっていない時
                data.splice(room, 1)
                playerCount -= 1
                roomCount -= 1
            } else {
                if (data[room].user1.data.id == socket.id){ // 部屋の一人目が抜けた時
                    data[room].user1.data.command = "emit"
                    if (data[room].user2.data.command != "emit"){
                        socket.to(data[room].user2.data.id).emit("disconnection", {})
                    }
                } else { // 部屋の二人目が抜けた時
                    data[room].user2.data.command == "emit"
                    if (data[room].user1.data.command != "emit"){
                        socket.to(data[room].user1.data.id).emit("disconnection", {})
                    }
                }
                // 部屋の両方の接続が切れた時、部屋情報を削除
                if (data[room].user1.data.command == "emit" && data[room].user2.data.command == "emit"){
                    let check = []
                    for (let i = 0; i < IdAndRoom.length; i++){
                        if (IdAndRoom[i][1] == room){
                            check.push(i)
                        } else if (IdAndRoom[i][1] > room){ // 抜ける部屋より大きい部屋番号を1ずつ減らす
                            IdAndRoom[i][1] -= 1
                        }
                    }
                    // 部屋情報から削除
                    IdAndRoom.splice(check[0], 1)
                    IdAndRoom.splice(check[1], 1)
                    data.splice(room, 1)
                    // プレイヤー人数をふたり減らす
                    playerCount -= 2
                    // 部屋数を一つ減らす
                    roomCount -= 1
                }
            }
        }
	    console.log("disconnect")
    })
})


