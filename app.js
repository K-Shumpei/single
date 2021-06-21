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
const end = require("./js_script/5_end_process")

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
            info.user1.data = {id: socket.id, command: ""}
            info.user1.con = {TN: name, p_con: "", f_con: "", used: "", log: ""}
            data.push(info)
            io.to(socket.id).emit("find enemy", {})
        } else {
            data[room_search(socket.id)].user2.data = {id: socket.id, command: ""}
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
                delete data[room]["user" + team[0]].team
                data[room]["user" + team[0]].data.command = 4
                // 相手がまだの時
                if (data[room]["user" + team[1]].data.command == ""){
                    io.to(data[room]["user" + team[0]].data.id).emit("waiting me", {})
                    io.to(data[room]["user" + team[1]].data.id).emit("waiting you", {})
                } else {
                    // 相手が選んでいる時
                    main.battleStart(data[room])
                    io.to(data[room].user1.data.id).emit("battle start", data[room], 1, 2)
                    io.to(data[room].user2.data.id).emit("battle start", data[room], 2, 1)
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
    socket.on("action decide", function(val) {
        const room = room_search(socket.id)
        for (const team of [[1, 2], [2, 1]]){
            // コマンドを記録
            if (data[room]["user" + team[0]].data.id == socket.id){
                data[room]["user" + team[0]].data.command = val
                // ボルチェンなどで交換する時
                if (data[room]["user" + team[0]].con.f_con == "選択中"){
                    summon.pokeReplace(rec[room]["user" + team[0]], data[room]["user" + team[1]])
                    summon.activAbility(rec[room]["user" + team[0]], data[room]["user" + team[1]], 1)

                    // 交代の後の残りの処理
                    // 24.きょうせい
                    // 25.おどりこ
                    // 26.次のポケモンの行動

                    // 相手が行動済の時
                    if (data[room]["user" + team[1]].data.command == ""){
                        // ターン終了前の処理
                        end.endProcess(rec[room]["user" + team[0]], rec[room]["user" + team[1]])
                        return
                    }
                    // 相手がまだ交代していない時
                    let atk = rec[room]["user" + team[1]]
                    let def = rec[room]["user" + team[0]]
                    let order = [atk, def]
                    let move = success.moveSuccessJudge(atk, def, order)
                    if (move == false){
                        processAtFailure(atk)
                    } else {
                        if (move[9] == "反射"){
                            let save = atk
                            atk = def
                            def = save
                        }
                        if (process.moveProcess(atk, def, move, order) == "stop"){
                            atk.data.command = ""
                            return
                        }
                    }
                    atk.data.command = ""
                    end.endProcess(atk, def)
                    io.to(data[room].user1.data.id).emit("run battle", data[room], 1, 2)
                    io.to(data[room].user2.data.id).emit("run battle", data[room], 2, 1)
                    return
                }
                // ひんしのポケモンを交換する時
                if (data[room]["user" + team[0]].con.f_con.includes("ひんし")){
                    summon.pokeReplace(data[room]["user" + team[0]], data[room]["user" + team[1]])
                    summon.activAbility(data[room]["user" + team[0]], data[room]["user" + team[1]], 1)
                    data[room]["user" + team[0]].data.command = ""
                    io.to(data[room].user1.data.id).emit("run battle", data[room], 1, 2)
                    io.to(data[room].user2.data.id).emit("run battle", data[room], 2, 1)
                    return
                }
                // お互いが行動する時に、相手が選択している時
                if (data[room]["user" + team[1]].data.command != ""){
                    main.runBattle(data[room])
                    io.to(data[room].user1.data.id).emit("run battle", data[room], 1, 2)
                    io.to(data[room].user2.data.id).emit("run battle", data[room], 2, 1)
                    return
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


