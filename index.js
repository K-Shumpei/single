$(function () {
    var socketio = io()

    // チームデータ送信
    $("#team_set").submit(function() {
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
        let select = [document.select.first.value, document.select.second.value, document.select.third.value]
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

    // お互いの選出が完了した
    socketio.on("battle start", function(data, me, you) {
        document.getElementById("headline").textContent = "対戦が始まりました"
        document.getElementById("select").style.display = "none"
        document.getElementById("both_team").style.display = "block"
        document.getElementById("battle_table").style.display = "block"
        document.getElementById("3_team").style.display = "none"
        document.getElementById("4_team").style.display = "none"
        document.getElementById("5_team").style.display = "none"

        // 選出した3匹のポケモンの情報を記入
        for (let i = 0; i < 3; i++){
            for (const parameter of [
                "name", "sex", "level", "type", "nature", "ability", "item", 
                "last_HP", "full_HP", 
                "A_AV", "B_AV", "C_AV", "D_AV", "S_AV", 
                "move_0", "PP_0", "last_0", 
                "move_1", "PP_1", "last_1", 
                "move_2", "PP_2", "last_2", 
                "move_3", "PP_3", "last_3", 
                "H_IV", "A_IV", "B_IV", "C_IV", "D_IV", "S_IV", 
                "H_EV", "A_EV", "B_EV", "C_EV", "D_EV", "S_EV", "life"]){
                document.getElementById(i + "_" + parameter).textContent = data["user" + me]["poke" + i][parameter]
            }
            if (document.getElementById(i + "_name").textContent == "ミミッキュ"){
                document.getElementById(i + "_form").textContent = "ばけたすがた"
            }
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
            document.getElementById("A_" + parameter).textContent = data["user" + me].con[parameter]
        }
        for (const parameter of ["p_con", "f_con", "used", "log"]){
            document.battle["A_" + parameter].value = data["user" + me].con[parameter]
        }
        for (let i = 0; i < pokemon.length; i++){
            if (data["user" + me].con.name == pokemon[i][1]){
                document.getElementById("A_image").src = "poke_figure/" + pokemon[i][0] + ".gif"
            }
        }
        // 相手のポケモンの情報を記入
        for (const parameter of ["name", "sex", "level", "type", "abnormal", "A_rank", "B_rank", "C_rank", "D_rank", "S_rank", "X_rank", "Y_rank"]){
            document.getElementById("B_" + parameter).textContent = data["user" + you].con[parameter]
        }
        for (const parameter of ["p_con", "f_con", "used"]){
            document.battle["B_" + parameter].value = data["user" + you].con[parameter]
        }
        for (let i = 0; i < pokemon.length; i++){
            if (data["user" + you].con.name == pokemon[i][1]){
                document.getElementById("B_image").src = "poke_figure/" + pokemon[i][0] + ".gif"
            }
        }
        // ボタンの無効化
        for (let i = 0; i < 7; i++){
            document.getElementById("radio_" + i).disabled = data["user" + me].data["radio_" + i]
            document.getElementById("radio_" + i).checked = false
        }
        
        //start_action_timer()
    })

    // コマンドの送信
    $("#battle").submit(function() {
        let val = document.battle.radio.value
        if (document.battle.A_p_con.value.includes("反動で動けない") 
        || document.battle.A_p_con.value.includes("溜め技") 
        || document.battle.A_p_con.value.includes("あばれる") 
        || document.battle.A_p_con.value.includes("アイスボール") 
        || document.battle.A_p_con.value.includes("ころがる") 
        || document.battle.A_p_con.value.includes("がまん")){
            val = undefined
        }
        socketio.emit("action decide", val)
        document.getElementById("battle_button").disabled = true
        return false
    })

    // 対戦の記録を受信
    socketio.on("run battle", function(data, me, you) {
        // 選出した3匹のポケモンの情報を記入
        for (let i = 0; i < 3; i++){
            for (const parameter of [
                "name", "sex", "level", "type", "nature", "ability", "item", 
                "last_HP", "full_HP", 
                "A_AV", "B_AV", "C_AV", "D_AV", "S_AV", 
                "move_0", "PP_0", "last_0", 
                "move_1", "PP_1", "last_1", 
                "move_2", "PP_2", "last_2", 
                "move_3", "PP_3", "last_3", 
                "H_IV", "A_IV", "B_IV", "C_IV", "D_IV", "S_IV", 
                "H_EV", "A_EV", "B_EV", "C_EV", "D_EV", "S_EV", 
                "form", "recycle", "belch", "life"]){
                document.getElementById(i + "_" + parameter).textContent = data["user" + me]["poke" + i][parameter]
            }
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
            document.getElementById("A_" + parameter).textContent = data["user" + me].con[parameter]
        }
        for (const parameter of ["p_con", "f_con", "used", "log"]){
            document.battle["A_" + parameter].value = data["user" + me].con[parameter]
        }
        for (let i = 0; i < pokemon.length; i++){
            if (data["user" + me].con.name == pokemon[i][1]){
                document.getElementById("A_image").src = "poke_figure/" + pokemon[i][0] + ".gif"
            }
        }
        if (data["user" + me].con.name == ""){
            document.getElementById("A_image").src = ""
        }
        // 相手のポケモンの情報を記入
        for (const parameter of ["name", "sex", "level", "type", "abnormal", "A_rank", "B_rank", "C_rank", "D_rank", "S_rank", "X_rank", "Y_rank"]){
            document.getElementById("B_" + parameter).textContent = data["user" + you].con[parameter]
        }
        for (const parameter of ["p_con", "f_con", "used"]){
            document.battle["B_" + parameter].value = data["user" + you].con[parameter]
        }
        for (let i = 0; i < pokemon.length; i++){
            if (data["user" + you].con.name == pokemon[i][1]){
                document.getElementById("B_image").src = "poke_figure/" + pokemon[i][0] + ".gif"
            }
        }
        // HPバーの表示
        if (data["user" + me].con.f_con.includes("ひんし")){
            document.getElementById("A_HP_bar").value = 0
            document.getElementById("A_percent").textContent = 0
        } else {
            document.getElementById("A_HP_bar").value = data["user" + me].con.last_HP / data["user" + me].con.full_HP
            document.getElementById("A_percent").textContent = Math.ceil(data["user" + me].con.last_HP * 100 / data["user" + me].con.full_HP)
        }
        if (data["user" + you].con.f_con.includes("ひんし")){
            document.getElementById("B_HP_bar").value = 0
            document.getElementById("B_percent").textContent = 0
        } else {
            document.getElementById("B_HP_bar").value = data["user" + you].con.last_HP / data["user" + you].con.full_HP
            document.getElementById("B_percent").textContent = Math.ceil(data["user" + you].con.last_HP * 100 / data["user" + you].con.full_HP)
        }
        // ボタンの無効化
        for (let i = 0; i < 7; i++){
            document.getElementById("radio_" + i).disabled = data["user" + me].data["radio_" + i]
            document.getElementById("radio_" + i).checked = false
        }
        // 決定ボタンの有効化
        if (!data["user" + you].con.f_con.includes("ひんし") && !data["user" + you].con.f_con.includes("選択中")){
            document.getElementById("battle_button").disabled = false
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