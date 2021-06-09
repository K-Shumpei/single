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
            io.to(socket.id).emit("find enemy", {})
        } else {
            data[room_search(socket.id)].user2 = {name: name, id: socket.id, command: "yet"}
            data[room_search(socket.id)].team2 = team_data
            // ポケモンの選出
            io.to(data[room_search(socket.id)].user1.id).emit("select pokemon", data[room_search(socket.id)], 1, 2)
            io.to(data[room_search(socket.id)].user2.id).emit("select pokemon", data[room_search(socket.id)], 2, 1)
        }

    })

    // 選出ポケモンを選んだ
    socket.on("get ready", function(select) {
        const room = room_search(socket.id)
        if (data[room].user1.id == socket.id){
            data[room].user1.select = select
            // 相手がまだの時
            if (data[room].user2.command == "yet"){
                data[room].user1.command = true
                io.to(data[room].user1.id).emit("waiting me", {})
                io.to(data[room].user2.id).emit("waiting you", {})
            } else {
                // 相手が選んでいる時
                io.to(data[room].user1.id).emit("battle start", data[room], 1, 2)
                io.to(data[room].user2.id).emit("battle start", data[room], 2, 1)
                data[room].user2.command = "yet"
            }
        } else {
            data[room].user2.select = select
            if (data[room].user1.command == "yet"){
                data[room].user2.command = true
                io.to(data[room].user2.id).emit("waiting me", {})
                io.to(data[room].user1.id).emit("waiting you", {})
            } else {
                io.to(data[room].user1.id).emit("battle start", data[room], 1, 2)
                io.to(data[room].user2.id).emit("battle start", data[room], 2, 1)
                data[room].user1.command = "yet"
            }
        }
    })

    // 各ターンの行動
    socket.on("action decide", function(val) {
        const room = room_search(socket.id)
        if (data[room].user1.id == socket.id){
            // 相手がまだの時
            if (data[room].user2.command == "yet"){
                data[room].user1.command = val
                io.to(socket.id).emit("wait your action", {})
                io.to(data[room].user2.id).emit("wait my action", val)
            } else {
                // 相手が選んでいる時
                io.to(data[room].user1.id).emit("action decide", data[room].user2.command)
                io.to(data[room].user2.id).emit("action decide", val)
                data[room].user2.command = "yet"
            }
        } else {
            if (data[room].user1.command == "yet"){
                data[room].user2.command = val
                io.to(socket.id).emit("wait your action", {})
                io.to(data[room].user1.id).emit("wait my action", val)
            } else {
                io.to(data[room].user1.id).emit("action decide", val)
                io.to(data[room].user2.id).emit("action decide", data[room].user1.command)
                data[room].user1.command = "yet"
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


