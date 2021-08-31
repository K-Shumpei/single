// ArrayをWorkbookに変換する
// 参照：https://github.com/SheetJS/js-xlsx/issues/163
function aoa_to_workbook(data/*:Array<Array<any> >*/, opts)/*:Workbook*/ {
    return sheet_to_workbook(XLSX.utils.aoa_to_sheet(data, opts), opts);
}

// SheetをWorkbookに追加する
// 参照：https://github.com/SheetJS/js-xlsx/issues/163
function sheet_to_workbook(sheet/*:Worksheet*/, opts)/*:Workbook*/ {
    var n = opts && opts.sheet ? opts.sheet : "Sheet1"
    var sheets = {}
    sheets[n] = sheet
    return { SheetNames: [n], Sheets: sheets }
}

// stringをArrayBufferに変換する
// 参照：https://stackoverflow.com/questions/34993292/how-to-save-xlsx-data-to-file-as-a-blob
function s2ab(s){
    var buf = new ArrayBuffer(s.length)
    var view = new Uint8Array(buf)
    for (var i = 0; i < s.length; i++){
        view[i] = s.charCodeAt(i) & 0xFF
    } 
    return buf
}

function saveParty(){
    const fileName = document.getElementById("savePartyName").value
    if (fileName == ""){
        alert("ファイル名を入力して下さい")
        return
    }

    let teamData = [["名前", "性別", "レベル", "特性", "持ち物", "性格", "H個体値", "H努力値", "A個体値", "A努力値", "B個体値", "B努力値", "C個体値", "C努力値", "D個体値", "D努力値", "S個体値", "S努力値", "技1", "PP1", "技2", "PP2", "技3", "PP3", "技4", "PP4"]]

    for (let i = 0; i < 6; i++){
        let data = []
        for (const ID of ["name", "sex", "level", "ability", "item", "nature"]){
            if (ID == "level"){
                data.push(Number(document.getElementById(i + "_" + ID).textContent))
            } else {
                data.push(String(document.getElementById(i + "_" + ID).textContent))
            }
        }
        for (const parameter of ["H", "A", "B", "C", "D", "S"]){
            data.push(Number(document.getElementById(i + "_" + parameter + "_IV").textContent))
            data.push(Number(document.getElementById(i + "_" + parameter + "_EV").textContent))
        }
        for (let j = 0; j < 4; j++){
            data.push(String(document.getElementById(i + "_move_" + j).textContent))
            data.push(Number(document.getElementById(i + "_PP_" + j).textContent))
        }
        teamData.push(data)
    }


    // 書き込み時のオプションは以下を参照
    // https://github.com/SheetJS/js-xlsx/blob/master/README.md#writing-options
    let write_opts = {
        type: 'binary'
    }

    // ArrayをWorkbookに変換する
    let wb = aoa_to_workbook(teamData);
    let wb_out = XLSX.write(wb, write_opts);

    // WorkbookからBlobオブジェクトを生成
    // 参照：https://developer.mozilla.org/ja/docs/Web/API/Blob
    let blob = new Blob([s2ab(wb_out)], { type: 'application/octet-stream' });

    // FileSaverのsaveAs関数で、xlsxファイルとしてダウンロード
    // 参照：https://github.com/eligrey/FileSaver.js/
    saveAs(blob, fileName + ".xlsx")
}




//******************
// 保存チームの呼び出し
//******************

var X = XLSX;
    
// ファイル選択時のメイン処理
function handleFile(e) {

    var files = e.target.files;
    var f = files[0];

    var reader = new FileReader();
    reader.onload = function (e) {
        var data = e.target.result;
        var wb;
        var arr = fixdata(data);
        wb = X.read(btoa(arr), {
            type: 'base64',
            cellDates: true,
        });

        var output = "";
        output = to_json(wb);
        console.log(output);

        $("pre#result").html(JSON.stringify(output, null, 2));

        for (let i = 0; i < 6; i++){
            let data = output.Sheet1[i]
            document.poke_name.poke_name.value = data.名前
            set_ID()
            const sex = [[" ♂ ", "male"], [" ♀ ", "female"], [" - ", "not"]]
            for (let j = 0; j < 3; j++){
                if (data.性別 == sex[j][0]){
                    document.getElementById(sex[j][1]).checked = true
                }
            }
            document.poke_ID.ability.value = data.特性
            document.poke_ID.poke_item.value = data.持ち物

            // 実数値計算
            for (const parameter of ["H", "A", "B", "C", "D", "S"]){
                document.input_value[parameter + "_IV"].value = data[parameter + "個体値"]
                document.input_value[parameter + "_EV"].value = data[parameter + "努力値"]
            }
            const nature = [
                ['てれや', 'さみしがり', 'いじっぱり', 'やんちゃ', 'ゆうかん'], 
                ['ずぶとい', 'がんばりや', 'わんぱく', 'のうてんき', 'のんき'], 
                ['ひかえめ', 'おっとり', 'すなお', 'うっかりや', 'れいせい'], 
                ['おだやか', 'おとなしい', 'しんちょう', 'きまぐれ', 'なまいき'], 
                ['おくびょう', 'せっかち', 'ようき', 'むじゃき', 'まじめ']
            ]
            for (let j = 0; j < 5; j++){
                for (let k = 0; k < 5; k++){
                    if (data.性格 == nature[j][k]){
                        document.getElementById("nature").textContent = data.性格
                        document.getElementById("nature_plus_" + (j+1)).checked = true
                        document.getElementById("nature_minus_" + (k+1)).checked = true
                    }
                }
            }
            AV_calc()

            // 技の入力
            for (let j = 0; j < 4; j++){
                document.getElementById("move" + j).value = data["技" + (j+1)]
                set_move(j)
                document.getElementById("PP" + String(j)).textContent = data["PP" + (j+1)]
            }
            document.getElementById("team" + i).checked = true

            // チームにセット
            set_pokemon()
        }

    };

    reader.readAsArrayBuffer(f);

    
}

// ファイルの読み込み
function fixdata(data) {
    var o = "",
        l = 0,
        w = 10240;
    for (; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w,
        l * w + w)));
    o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
    return o;
}

// ワークブックのデータをjsonに変換
function to_json(workbook) {
    var result = {};
    workbook.SheetNames.forEach(function (sheetName) {
        var roa = X.utils.sheet_to_json(
            workbook.Sheets[sheetName],
            {
                raw: true,
            });
        if (roa.length > 0) {
            result[sheetName] = roa;
        }
    });
    return result;
}

// 画面初期化
$(document).ready(function () {

    // ファイル選択欄 選択イベント
    // http://cccabinet.jpn.org/bootstrap4/javascript/forms/file-browser
    $('.custom-file-input').on('change', function (e) {
        handleFile(e);
        $(this).next('.custom-file-label').html($(this)[0].files[0].name);
    })
});