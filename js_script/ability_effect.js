// なかまづくりが失敗する相手の特性
exports.entrainmentEnemy = function(){
    return entrainment_enemy_ability_list
}
var entrainment_enemy_ability_list = [
    'ARシステム', 
    'アイスフェイス', 
    'うのミサイル', 
    'きずなへんげ', 
    'ぎょぐん', 
    'じんばいったい', 
    'スワームチェンジ', 
    'ぜったいねむり', 
    'ダルマモード', 
    'なまけ', 
    'バトルスイッチ', 
    'ばけのかわ', 
    'マルチタイプ', 
    'リミットシールド'
]

// なかまづくりが失敗する自分の特性
exports.entrainmentSelf = function(){
    return entrainment_self_ability_list
}
var entrainment_self_ability_list = [
    'アイスフェイス', 
    'イリュージョン', 
    'うのミサイル', 
    'かがくのちから', 
    'かがくへんかガス', 
    'かわりもの', 
    'じんばいったい', 
    'ダルマモード', 
    'てんきや', 
    'トレース', 
    'ばけのかわ', 
    'はらぺこスイッチ', 
    'フラワーギフト', 
    'レシーバー'
]

// いえきが失敗する相手の特性
exports.gastro = function(){
    return gastro_acid_enemy_ability_list
}
var gastro_acid_enemy_ability_list = [
    'ARシステム', 
    'アイスフェイス', 
    'うのミサイル', 
    'きずなへんげ', 
    'ぎょぐん', 
    'じんばいったい', 
    'スワームチェンジ', 
    'ぜったいねむり', 
    'ダルマモード', 
    'ばけのかわ', 
    'バトルスイッチ', 
    'マルチタイプ', 
    'リミットシールド'
]

// なりきりが失敗する相手の特性
exports.rolePlayEnemy = function(){
    return role_play_enemy_ability_list
}
var role_play_enemy_ability_list = [
    'てんきや', 
    'トレース', 
    'ふしぎなまもり', 
    'フラワーギフト', 
    'マルチタイプ', 
    'イリュージョン', 
    'かわりもの', 
    'ダルマモード', 
    'バトルスイッチ', 
    'ARシステム', 
    'かがくのちから', 
    'きずなへんげ', 
    'ぎょぐん', 
    'スワームチェンジ', 
    'ぜったいねむり', 
    'ばけのかわ', 
    'リミットシールド', 
    'レシーバー', 
    'アイスフェイス', 
    'じんばいったい', 
    'はらぺこスイッチ', 
    'うのミサイル', 
    'かがくへんかガス'
]

// なりきりが失敗する自分の特性
exports.rolePlaySelf = function(){
    return role_play_self_ability_list
}
var role_play_self_ability_list = [
    'ARシステム', 
    'アイスフェイス', 
    'うのミサイル', 
    'きずなへんげ', 
    'ぎょぐん', 
    'じんばいったい', 
    'スワームチェンジ', 
    'ぜったいねむり', 
    'ダルマモード', 
    'ばけのかわ', 
    'バトルスイッチ', 
    'はらぺこスイッチ', 
    'マルチタイプ', 
    'リミットシールド'
]

// シンプルビームが失敗する相手の特性
exports.simpleBeam = function(){
    return simple_beam_enemy_ability_list
}
var simple_beam_enemy_ability_list = [
    'ARシステム', 
    'アイスフェイス', 
    'うのミサイル', 
    'きずなへんげ', 
    'ぎょぐん', 
    'じんばいったい', 
    'スワームチェンジ', 
    'ぜったいねむり', 
    'ダルマモード', 
    'なまけ', 
    'ばけのかわ', 
    'バトルスイッチ', 
    'マルチタイプ', 
    'リミットシールド'
]

// なやみのタネが失敗する相手の特性
exports.worrySeed = function(){
    return worry_seed_enemy_ability_list
}
var worry_seed_enemy_ability_list = [
    'ARシステム', 
    'アイスフェイス', 
    'うのミサイル', 
    'きずなへんげ', 
    'ぎょぐん', 
    'じんばいったい', 
    'スワームチェンジ', 
    'ぜったいねむり', 
    'ダルマモード', 
    'なまけ', 
    'ばけのかわ', 
    'バトルスイッチ', 
    'マルチタイプ', 
    'リミットシールド'
]

// どちらかが当てはまればスキルスワップが失敗する特性
exports.skillSwap = function(){
    return skill_swap_ability_list
}
var skill_swap_ability_list = [
    'ARシステム', 
    'アイスフェイス', 
    'イリュージョン', 
    'うのミサイル', 
    'かがくへんかガス', 
    'きずなへんげ', 
    'ぎょぐん', 
    'じんばいったい', 
    'スワームチェンジ', 
    'ぜったいねむり', 
    'ダルマモード', 
    'ばけのかわ', 
    'バトルスイッチ', 
    'はらぺこスイッチ', 
    'ふしぎなまもり', 
    'マルチタイプ', 
    'リミットシールド'
]

// ミイラが失敗する自分の特性
exports.mummy = function(){
    return mummy_self_ability_list
}
var mummy_self_ability_list = [
    'ARシステム', 
    'アイスフェイス', 
    'うのミサイル', 
    'きずなへんげ', 
    'ぎょぐん', 
    'じんばいったい', 
    'スワームチェンジ', 
    'ぜったいねむり', 
    'ダルマモード', 
    'ばけのかわ', 
    'バトルスイッチ', 
    'マルチタイプ', 
    'リミットシールド'
]

// さまようたましいが失敗する自分の特性
exports.wanderSpirit = function(){
    return wandering_spirit_self_ability_list
}
var wandering_spirit_self_ability_list = [
    'ARシステム', 
    'アイスフェイス', 
    'イリュージョン', 
    'うのミサイル', 
    'かがくへんかガス', 
    'ぎょぐん', 
    'じんばいったい', 
    'スワームチェンジ', 
    'ダルマモード', 
    'ばけのかわ', 
    'バトルスイッチ', 
    'はらぺこスイッチ', 
    'ふしぎなまもり'
]

// かがくへんかガスにより発動しなくなる特性：これら以外
exports.neutralizing = function(){
    return neutralizing_gas_ability_list
}
var neutralizing_gas_ability_list = [
    'ARシステム', 
    'アイスフェイス', 
    'うのミサイル', 
    'かがくへんかガス', 
    'ぎょぐん', 
    'じんばいったい', 
    'スワームチェンジ', 
    'ダルマモード', 
    'ばけのかわ', 
    'バトルスイッチ'
]

// かがくへんかガスの発動により無効になる特性
var neutralizing_gas_invalidation_ability_list = [
    'イリュージョン', 
    'かわりもの', 
    'なまけ', 
    'はらぺこスイッチ', 
    'ふしぎなまもり', 
    'フラワーギフト'
]

// トレースが失敗する特性
exports.trace = function(){
    return trace_ability_list
}
var trace_ability_list = [
    'てんきや', 
    'トレース', 
    'フラワーギフト', 
    'マルチタイプ', 
    'イリュージョン', 
    'かわりもの', 
    'ダルマモード', 
    'バトルスイッチ', 
    'ARシステム', 
    'かがくのちから', 
    'きずなへんげ', 
    'ぎょぐん', 
    'スワームチェンジ', 
    'ぜったいねむり', 
    'ばけのかわ', 
    'リミットシールド',
    'レシーバー', 
    'アイスフェイス', 
    'うのミサイル', 
    'かがくへんかガス', 
    'じんばいったい', 
    'はらぺこスイッチ'
]
