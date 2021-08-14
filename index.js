$(function () {
    var socketio = io()

    // パスワード送信
    $("#emitPass").submit(function() {
        console.log($("#pass").val())
        socketio.emit("password", $("#pass").val())
        $("#pass").val("")
        return false
    })
    // パスワードの正誤
    socketio.on("pass", function(){
        document.getElementById("headline").textContent = "チームを登録してください"
        document.getElementById("password").style.display = "none"
        document.getElementById("mainContent").style.display = "block"
    })
    socketio.on("miss", function(){
        console.log("miss")
        alert("パスワードが違います")
    })

    // チームデータ送信
    $("#team_set").submit(function() {
        if ($("#my_name").val() == ""){
            alert("名前を入力してください")
            return false
        }
        let team_data = []
        for (let i = 0; i < 6; i++){
            let each = {}
            for (const parameter of [
                "name", "sex", "type", "nature", "ability", "item", "abnormal", 
                "move_0", "move_1", "move_2", "move_3", 
                "recycle", "belch", "form", "life", "belch", "recycle", "form"]){
                each[parameter] = document.getElementById(i + "_" + parameter).textContent
            }
            for (const parameter of [
                "level", "last_HP", "full_HP", 
                "A_AV", "B_AV", "C_AV", "D_AV", "S_AV", 
                "PP_0", "last_0", 
                "PP_1", "last_1", 
                "PP_2", "last_2", 
                "PP_3", "last_3", 
                "H_IV", "A_IV", "B_IV", "C_IV", "D_IV", "S_IV", 
                "H_EV", "A_EV", "B_EV", "C_EV", "D_EV", "S_EV"]){
                each[parameter] = Number(document.getElementById(i + "_" + parameter).textContent)
            }
            team_data.push(each)
        }
        socketio.emit("team_data", $("#my_name").val(), team_data)
        $("#my_name").val("")
        return false
    })

    // 一人目は対戦相手を探す
    socketio.on("find enemy", function() {
        document.getElementById("headline").textContent = "対戦相手を探しています"
        document.getElementById("register").style.display = "none"
        document.getElementById("trainer_name").style.display = "none"
    })

    // 対戦相手が見つかり、選出するポケモンを選ぶ
    socketio.on("select pokemon", function(data, me, you) {
        document.getElementById("headline").textContent = "選出するポケモンを選んでください"
        document.getElementById("register").style.display = "none"
        document.getElementById("select").style.display = "block"
        document.getElementById("trainer_name").style.display = "none"
        for (let i = 0; i < 6; i++){
            document.getElementById("selectPoke" + i).style.display = "block"
        }
        document.getElementById("first0").checked = true
        document.getElementById("second1").checked = true
        document.getElementById("third2").checked = true
        selectPoke()

        // 名前の設定
        document.getElementById("myName").textContent = data["user" + me].con.TN
        document.getElementById("yourName").textContent = data["user" + you].con.TN
        document.getElementById("MyName").textContent = data["user" + me].con.TN
        document.getElementById("My_Name").textContent = data["user" + me].con.TN
        document.getElementById("YourName").textContent = data["user" + you].con.TN
        document.getElementById("Your_Name").textContent = data["user" + you].con.TN
        // 画像の設定
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < pokemon.length; j++){
                if (data["user" + me].team[i].name == pokemon[j][1]){
                    document.getElementById("player_" + i).src = "poke_figure/" + pokemon[j][0] + ".gif"
                    document.getElementById("me_" + i).src = "poke_figure/" + pokemon[j][0] + ".gif"
                }
            }
        }
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < pokemon.length; j++){
                if (data["user" + you].team[i].name == pokemon[j][1]){
                    document.getElementById("enemy_" + i).src = "poke_figure/" + pokemon[j][0] + ".gif"
                    document.getElementById("you_" + i).src = "poke_figure/" + pokemon[j][0] + ".gif"
                }
            }
        }

    })

    // 選出するポケモンのデータを送信　[1匹目、2匹目、3匹目]の番号リストを送信
    $("#battle_start").submit(function() {
        let select = [document.battle.first.value, document.battle.second.value, document.battle.third.value]
        socketio.emit("get ready", select)
        return false
    })

    // 自分が先に選出した
    socketio.on("waiting me", function() {
        document.getElementById("myName").textContent += "(選出完了)"
        document.getElementById("battle_start_button").disabled = true
    })
    // 相手が先に選出した
    socketio.on("waiting you", function() {
        document.getElementById("yourName").textContent += "(選出完了)"
    })


    // コマンドの送信
    $("#battle").submit(function() {
        let val = document.battle.radio.value
        if (document.battle.A_p_con.value.includes("反動で動けない") 
        || document.battle.A_p_con.value.includes("溜め技") 
        || document.battle.A_p_con.value.includes("あばれる") 
        || document.battle.A_p_con.value.includes("アイスボール") 
        || document.battle.A_p_con.value.includes("ころがる") 
        || document.battle.A_p_con.value.includes("がまん") 
        || document.battle.A_p_con.value.includes("さわぐ")){
            val = undefined
        }
        if (val == ""){
            alert("行動を選択してください")
            return false
        }
        const mega = document.getElementById("A_mega").checked
        const Z = document.getElementById("A_Z").checked
        const ultra = document.getElementById("A_ultra").checked
        const dyna = document.getElementById("A_dyna").checked
        const giga = document.getElementById("A_giga").checked
        const option = {mega: mega, Z: Z, ultra: ultra, dyna: dyna, giga: giga}
        socketio.emit("action decide", val, option)
        document.getElementById("battle_button").disabled = true
        return false
    })

    // 対戦の記録を受信
    socketio.on("run battle", function(me, you) {
        document.getElementById("headline").textContent = "対戦が始まりました"
        document.getElementById("select").style.display = "none"
        document.getElementById("both_team").style.display = "block"
        document.getElementById("battle_table").style.display = "block"
        document.getElementById("3_team").style.display = "none"
        document.getElementById("4_team").style.display = "none"
        document.getElementById("5_team").style.display = "none"
        for (let i = 0; i < 6; i++){
            document.getElementById("teamPoke" + i).style.display = "block"
            document.getElementById("selectPoke" + i).style.display = "none"
        }
        // 選出した3匹のポケモンの情報を記入
        for (let i = 0; i < 3; i++){
            for (const parameter of [
                "name", "sex", "level", "type", "nature", "ability", "item", "abnormal", 
                "last_HP", "full_HP", 
                "A_AV", "B_AV", "C_AV", "D_AV", "S_AV", 
                "move_0", "PP_0", "last_0", 
                "move_1", "PP_1", "last_1", 
                "move_2", "PP_2", "last_2", 
                "move_3", "PP_3", "last_3", 
                "H_IV", "A_IV", "B_IV", "C_IV", "D_IV", "S_IV", 
                "H_EV", "A_EV", "B_EV", "C_EV", "D_EV", "S_EV", 
                "form", "recycle", "belch", "life"]){
                document.getElementById(i + "_" + parameter).textContent = me["poke" + i][parameter]
            }
            document.getElementById(i + "type0").src = ""
            document.getElementById(i + "type1").src = ""
            let type = document.getElementById(i + "_type").textContent.split("、")
            for (let j = 0; j < type.length; j++){
                document.getElementById(i + "type" + j).src = "type_figure/" + type[j] + ".gif"
            }
            document.getElementById(i + "_type").textContent = ""
        }
        // 戦闘に出したポケモンの情報を記入
        for (const parameter of [
            "name", "sex", "level", "type", "nature", "ability", "item", "abnormal", 
            "last_HP", "full_HP", 
            "A_AV", "B_AV", "C_AV", "D_AV", "S_AV", 
            "A_rank", "B_rank", "C_rank", "D_rank", "S_rank", "X_rank", "Y_rank", 
            "move_0", "PP_0", "last_0", 
            "move_1", "PP_1", "last_1", 
            "move_2", "PP_2", "last_2", 
            "move_3", "PP_3", "last_3"]){
            document.getElementById("A_" + parameter).textContent = me.con[parameter]
        }
        for (const parameter of ["p_con", "f_con", "used", "log"]){
            document.battle["A_" + parameter].value = me.con[parameter]
        }
        // 相手のポケモンの情報を記入
        for (const parameter of ["name", "sex", "level", "type", "abnormal", "A_rank", "B_rank", "C_rank", "D_rank", "S_rank", "X_rank", "Y_rank"]){
            document.getElementById("B_" + parameter).textContent = you.con[parameter]
        }
        for (const parameter of ["p_con", "f_con", "used"]){
            document.battle["B_" + parameter].value = you.con[parameter]
        }

        for (const team of [{data: me, char: "A"}, {data: you, char: "B"}]){
            // 画像のリセット
            document.getElementById(team.char + "_image").src = ""
            document.getElementById(team.char + "_HP_bar").value = 0
            document.getElementById(team.char + "_percent").textContent = "-"
            document.getElementById(team.char + "_type_image0").src = ""
            document.getElementById(team.char + "_type_image1").src = ""
            document.getElementById(team.char + "_type_image2").src = ""
            document.getElementById(team.char + "_type_image3").src = ""

            if (team.data.con.name != ""){
                // ポケモンの画像の設定
                for (let i = 0; i < pokemon.length; i++){
                    if (team.data.con.name == pokemon[i][1]){
                        document.getElementById(team.char + "_image").src = "poke_figure/" + pokemon[i][0] + ".gif"
                    }
                }
                // ポケモンのタイプの設定
                let type = document.getElementById(team.char + "_type").textContent.split("、")
                for (let i = 0; i < type.length; i++){
                    document.getElementById(team.char + "_type_image" + i).src = "type_figure/" + type[i] + ".gif"
                }
                document.getElementById(team.char + "_type").textContent = ""
                // HPバーの表示
                document.getElementById(team.char + "_HP_bar").value = team.data.con.last_HP / team.data.con.full_HP
                document.getElementById(team.char + "_percent").textContent = Math.ceil(team.data.con.last_HP * 100 / team.data.con.full_HP)
                document.getElementById(team.char + team.data.con.num + "_bar").style.display = "block"
                document.getElementById(team.char + team.data.con.num + "_HP_bar").value = team.data.con.last_HP / team.data.con.full_HP
                // メガ進化、Z技、ダイマックスのテキスト
                document.getElementById(team.char + "_mega_text").textContent = team.data.data.megaTxt
                document.getElementById(team.char + "_Z_text").textContent = team.data.data.ZTxt
                document.getElementById(team.char + "_ultra_text").textContent = team.data.data.ultraTxt
                document.getElementById(team.char + "_dyna_text").textContent = team.data.data.dynaTxt
                document.getElementById(team.char + "_giga_text").textContent = team.data.data.gigaTxt
            }
        }
        if (me.con.f_con.includes("ひんし")){
            document.getElementById("A" + me.con.num + "_HP_bar").value = 0
        }
        if (you.con.f_con.includes("ひんし")){
            document.getElementById("B" + you.con.num + "_HP_bar").value = 0
        }
    
        // メガ進化、Z技、ダイマックスのボタンの無効化
        document.getElementById("A_mega").checked = false
        document.getElementById("A_mega").disabled = me.data.megable
        document.getElementById("A_Z").checked = false
        document.getElementById("A_Z").disabled = me.data.Zable
        document.getElementById("A_ultra").checked = false
        document.getElementById("A_ultra").disabled = me.data.ultrable
        document.getElementById("A_dyna").checked = false
        document.getElementById("A_dyna").disabled = me.data.dynable
        document.getElementById("A_giga").checked = false
        document.getElementById("A_giga").disabled = me.data.gigable

        // ボタンの無効化
        for (let i = 0; i < 7; i++){
            document.getElementById("radio_" + i).disabled = me.data["radio_" + i]
            document.getElementById("radio_" + i).checked = false
        }

        // ダイマックス、キョダイマックス状態の時、技の変更
        if (document.getElementById("A_dyna_text").textContent.includes("3")){
            change_dyna_move()
        } else if (document.getElementById("A_giga_text").textContent.includes("3")){
            change_giga_move()
        }
        
       
        // 決定ボタンの有効化
        if ((!me.con.f_con.includes("ひんし") && !me.con.f_con.includes("選択中・・・")) 
        && (you.con.f_con.includes("ひんし") || you.con.f_con.includes("選択中・・・"))){
            document.getElementById("battle_button").disabled = true
        } else {
            document.getElementById("battle_button").disabled = false
        }
        // 勝敗
        if (me.con.f_con.includes("勝ち")){
            document.battle.A_log.value += me.con.TN + "　の　勝ち！" + "\n"
            document.getElementById("battle_button").disabled = true
        } else if (me.con.f_con.includes("負け")){
            document.battle.A_log.value += me.con.TN + "　の　負け！" + "\n"
            document.getElementById("battle_button").disabled = true
        }
        // スクロールバーを一番下に移動
        let obj = document.getElementById("A_log")
        obj.scrollTop = obj.scrollHeight
    })

    // 相手の接続が切れた時
    socketio.on("disconnection", function() {
        document.getElementById("headline").textContent = "相手の接続が切れました"
        document.battle.battle_log.value += "相手の接続が切れました。"
        document.getElementById("battle_button").disabled = true
    })
})