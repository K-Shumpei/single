



class get{
    constructor(team){
        this.team = team
    }

    get name(){
        return document.getElementById(this.team + "_poke").textContent
    }
    get sex(){
        return document.getElementById(this.team + "_sex").textContent
    }
    get level(){
        return Number(document.getElementById(this.team + "_level").textContent)
    }
    get type(){
        return document.getElementById(this.team + "_type").textContent
    }
    get nature(){
        return document.getElementById(this.team + "_nature").textContent
    }
    get ability(){
        return document.getElementById(this.team + "_ability").textContent
    }
    get item(){
        return document.getElementById(this.team + "_item").textContent
    }
    get abnormal(){
        return document.getElementById(this.team + "_abnormal").textContent
    }
    get full_HP(){
        return Number(document.getElementById(this.team + "_HP").textContent)
    }
    get last_HP(){
        return Number(document.getElementById(this.team + "_HP_last").textContent)
    }
    get A_AV(){
        return Number(document.getElementById(this.team + "_A_AV").textContent)
    }
    get B_AV(){
        return Number(document.getElementById(this.team + "_B_AV").textContent)
    }
    get C_AV(){
        return Number(document.getElementById(this.team + "_C_AV").textContent)
    }
    get D_AV(){
        return Number(document.getElementById(this.team + "_D_AV").textContent)
    }
    get S_AV(){
        return Number(document.getElementById(this.team + "_S_AV").textContent)
    }
    get A_rank(){
        return Number(document.getElementById(this.team + "_rank_A").textContent)
    }
    get B_rank(){
        return Number(document.getElementById(this.team + "_rank_B").textContent)
    }
    get C_rank(){
        return Number(document.getElementById(this.team + "_rank_C").textContent)
    }
    get D_rank(){
        return Number(document.getElementById(this.team + "_rank_D").textContent)
    }
    get S_rank(){
        return Number(document.getElementById(this.team + "_rank_S").textContent)
    }
    get accuracy_rank(){
        return Number(document.getElementById(this.team + "_rank_accuracy").textContent)
    }
    get evasiveness_rank(){
        return Number(document.getElementById(this.team + "_rank_evasiveness").textContent)
    }
    get p_con(){
        return document.battle[this.team + "_poke_condition"].value
    }
    get p_list(){
        return document.battle[this.team + "_poke_condition"].value.split("\n")
    }
    get p_len(){
        return Number(document.battle[this.team + "_poke_condition"].value.split("\n").length) - 1
    }
    get f_con(){
        return document.battle[this.team + "_field_condition"].value
    }
    get f_list(){
        return document.battle[this.team + "_field_condition"].value.split("\n")
    }
    get f_len(){
        return Number(document.battle[this.team + "_field_condition"].value.split("\n").length) - 1
    }
    get used(){
        return document.battle[this.team + "_used_move"].value
    }
}

var move = class{
    constructor(team, number){
        this.team = team
        this.number = number
    }

    get name(){
        return document.getElementById(this.team + "_move_" + this.number).textContent
    }
    get full_PP(){
        return Number(document.getElementById(this.team + "_move_" + this.number + "_PP").textContent)
    }
    get last_PP(){
        return Number(document.getElementById(this.team + "_move_" + this.number + "_last").textContent)
    }
}
