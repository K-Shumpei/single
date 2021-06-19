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

// 接続時の処理
io.on("connection", function(socket){
    console.log("connection")

    // コネションが確率されたら実行
    socket.emit("connected", {})

    // 切断時の処理
    socket.on("disconnect", () => {
        const room = room_search(socket.id)
        if (room != undefined){
            if (data[room].user2 == ""){ // 対戦相手がまだ見つかっていない時
                data.splice(room, 1)
                rec.splice(room, 1)
                playerCount -= 1
                roomCount -= 1
            } else {
                if (data[room].user1.id == socket.id){ // 部屋の一人目が抜けた時
                    data[room].user1 == ""
                    if (data[room].user2 != ""){
                        socket.to(data[room].user2.id).emit("disconnection", {})
                    }
                } else { // 部屋の二人目が抜けた時
                    data[room].user2 == ""
                    if (data[room].user1 != ""){
                        socket.to(data[room].user1.id).emit("disconnection", {})
                    }
                }
                // 部屋の両方の接続が切れた時、部屋情報を削除
                if (data[room].user1 == "" && data[room].user2 == ""){
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
                    rec.splice(room, 1)
                    // プレイヤー人数をふたり減らす
                    playerCount -= 2
                    // 部屋数を一つ減らす
                    roomCount -= 1
                }
            }
        }
	    console.log("disconnect")
    })

    // チームデータ受信
    socket.on('team_data',function(name, team_data){
        
        console.log('name: ' + name);
        //全員に配信
        io.emit('message', name);

        playerCount += 1
        if (playerCount % 2 == 1){
            roomCount += 1
        }

        IdAndRoom.push([socket.id, roomCount])

        if (playerCount % 2 == 1){
            let room = {user1: "", team1: "", user2: "", team2: ""}
            room.user1 = {name: name, id: socket.id, command: "yet"}
            room.team1 = team_data
            data.push(room)
            let type = {user1: "", user2: ""}
            type.user1 = {poke0: "", poke1: "", poke2: "", data: "", con: ""}
            type.user2 = {poke0: "", poke1: "", poke2: "", data: "", con: ""}
            type.user1.con = {
                TN: "", name: "", sex: "", level: "", type: "", nature: "", ability: "", item: "", abnormal: "", last_HP: "", full_HP: "", 
                move_0: "", PP_0: "", last_0: "", move_1: "", PP_1: "", last_1: "", move_2: "", PP_2: "", last_2: "", move_3: "", PP_3: "", last_3: "", 
                A_AV: "", B_AV: "", C_AV: "", D_AV: "", S_AV: "", A_rank: "", B_rank: "", C_rank: "", D_rank: "", S_rank: "", X_rank: "", Y_rank: "", 
                p_con: "", f_con: "", used: "", log: ""
            }
            type.user2.con = {
                TN: "", name: "", sex: "", level: "", type: "", nature: "", ability: "", item: "", abnormal: "", last_HP: "", full_HP: "", 
                move_0: "", PP_0: "", last_0: "", move_1: "", PP_1: "", last_1: "", move_2: "", PP_2: "", last_2: "", move_3: "", PP_3: "", last_3: "", 
                A_AV: "", B_AV: "", C_AV: "", D_AV: "", S_AV: "", A_rank: "", B_rank: "", C_rank: "", D_rank: "", S_rank: "", X_rank: "", Y_rank: "", 
                p_con: "", f_con: "", used: "", log: ""
            }
            type.user1.data = {name: name, command: "", radio_0: false, radio_1: false, radio_2: false, radio_3: false, radio_4: false, radio_5: false, radio_6: false, mega: "", Z: "", dina: ""}
            type.user1.con.TN = name
            rec.push(type)
            io.to(socket.id).emit("find enemy", {})
        } else {
            data[room_search(socket.id)].user2 = {name: name, id: socket.id, command: "yet"}
            data[room_search(socket.id)].team2 = team_data
            rec[room_search(socket.id)].user2.con.TN = name
            rec[room_search(socket.id)].user2.data = {name: name, command: "", radio_0: false, radio_1: false, radio_2: false, radio_3: false, radio_4: false, radio_5: false, radio_6: false, mega: "", Z: "", dina: ""}
            // ポケモンの選出
            io.to(data[room_search(socket.id)].user1.id).emit("select pokemon", data[room_search(socket.id)], 1, 2)
            io.to(data[room_search(socket.id)].user2.id).emit("select pokemon", data[room_search(socket.id)], 2, 1)
        }

    })

    // 選出ポケモンを選んだ
    socket.on("get ready", function(select) {
        const room = room_search(socket.id)
        for (let i = 1; i < 3; i++){
            if (data[room]["user" + i].id == socket.id){
                data[room]["user" + i].select = select
                rec[room]["user" + i].poke0 = data[room]["team" + i][select[0]]
                rec[room]["user" + i].poke1 = data[room]["team" + i][select[1]]
                rec[room]["user" + i].poke2 = data[room]["team" + i][select[2]]
                rec[room]["user" + i].data.command = 4
                // 相手がまだの時
                if (data[room]["user" + (i % 2 + 1)].command == "yet"){
                    data[room]["user" + i].command = true
                    io.to(data[room]["user" + i].id).emit("waiting me", {})
                    io.to(data[room]["user" + (i % 2 + 1)].id).emit("waiting you", {})
                } else {
                    // 相手が選んでいる時
                    ret = main.battleStart(rec[room])
                    io.to(data[room]["user" + i].id).emit("battle start", ret, i, (i % 2 + 1))
                    io.to(data[room]["user" + (i % 2 + 1)].id).emit("battle start", ret, (i % 2 + 1), i)
                    data[room]["user" + (i % 2 + 1)].command = "yet"
                    rec[room].user1.data.command = ""
                    rec[room].user2.data.command = ""

                    //action_timer = setInterval(function() {
                      //  console.log("passed 1 second")
                    //}, 1000)
                }
            }
        }
    })

    // 各ターンの行動
    socket.on("action decide", function(signal) {
        console.log(signal)
        const room = room_search(socket.id)
        for (const i of [1, 2]){
            // コマンドを記録
            if (data[room]["user" + i].id == socket.id){
                rec[room]["user" + i] = signal
                // 相手が選択している時
                if (rec[room]["user" + (i % 2 + 1)].data.command != ""){
                    ret = main.runBattle(rec[room])
                    io.to(data[room]["user" + i].id).emit("run battle", ret, i, (i % 2 + 1))
                    io.to(data[room]["user" + (i % 2 + 1)].id).emit("run battle", ret, (i % 2 + 1), i)
                    rec[room]["user" + i].data.command = ""
                    rec[room]["user" + (i % 2 + 1)].data.command = ""
                }
            }
        }
    })

    // 選択中・・・の時 val は yes か no
    socket.on("thinking", function(val) {
        const room = room_search(socket.id)
        if (data[room].user1.id == socket.id){
            data[room].user1.command = val
        } else {
            data[room].user2.command = val
        }
    })

    // 選択中のユーザーから受信
    socket.on("choose poke", function(val) {
        const room = room_search(socket.id)
        if (data[room].user1.id == socket.id){
            data[room].user1.command = val
            if (data[room].user2.command == "no" || data[room].user2.command != "yes"){
                io.to(data[room].user1.id).emit("summon poke", data[room].user2.command)
                io.to(data[room].user2.id).emit("summon poke", val)
                data[room].user1.command = "yet"
                data[room].user2.command = "yet"
            }
        } else {
            data[room].user2.command = val
            if (data[room].user1.command == "no" || data[room].user1.command != "yes"){
                io.to(data[room].user1.id).emit("summon poke", val)
                io.to(data[room].user2.id).emit("summon poke", data[room].user1.command)
                data[room].user1.command = "yet"
                data[room].user2.command = "yet"
            } 
        }
    })
})


