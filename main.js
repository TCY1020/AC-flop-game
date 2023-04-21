const GAME_STATE ={  //狀態管理
  FirstCardAwaits:'FirstCardAwaits',
  SecondCardAwaits:'SecondCardAwaits',
  CardsMatchFailed:'CardsMatchFailed',
  CardsMatched:'CardsMatched',
  GameFinished:'GameFinished',
}

const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://www.emojiall.com/images/60/google/2665-fe0f.png',                // 愛心
  'https://www.emojiall.com/images/60/google/2666-fe0f.png',                // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png', //梅花   
]

const view = {  //V = 介面有關的程式碼
  //物件屬性與韓式名稱相同可以省略
  getCardElement(index) {
     return `<div data-index=${index} class="card back"></div>`
     //預設back,給每張牌一個編號
  },
  getCardContent(index){
    const number = this.transformNumber((index % 13) + 1)
    //this為view
    const symbol = Symbols[Math.floor(index / 13)]
    return`
        <p>${number}</p>
        <img src="${symbol}" />
        <p>${number}</p>`
  },
  transformNumber(number) {//轉換成A J Q K
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },
  displayCards(indexes){//放入52張牌
    const rootElement = document.querySelector('#card')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join("")
  },
  flipCards(...cards) {
    cards.map( card =>{
      if (card.classList.contains('back')) {
        // 回傳正面
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        //render編號對應的number、symbol
        return
      }
      // 回傳背面
      card.classList.add('back')
      card.innerHTML = null
    })
  },
  pairCards(...cards) {
    cards.map(card =>{
      card.classList.add('paired')
    })    
  },
  renderScore(score) {
    document.querySelector(".score").textContent = `Score: ${score}`;
  },
  renderTriedTimes(times) {
    document.querySelector(".tried").textContent = `You've tried: ${times} times`;
  },
  appendWrongAnimation(...cards) { //配對失敗動畫
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', event => event.target.classList.remove('wrong'), { once: true })
    })
  },
  showGameFinished() {//遊戲結束時動畫
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}

const model ={  //M = 資料有關的程式碼
  revealedCards: [],//紀錄翻起來的第一張跟第二張卡
  isRevealedCardsMatched(){
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index %13
  },
  score: 0,
  triedTimes: 0
}

const controller ={  //C = 流程有關的程式碼
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards(){  //初始洗牌
    view.displayCards(utility.getRandomNumberArray(52))
  },
  
  dispatchCardAction(card){  
    if(!card.classList.contains('back')){//翻開的卡無法動作
      return
    }
    switch (this.currentState){
      case GAME_STATE.FirstCardAwaits: //在等待翻第一張牌的狀態時
        view.flipCards(card)//可以做翻盤的動作
        model.revealedCards.push(card)//將翻到的排寫入Array
        this.currentState = GAME_STATE.SecondCardAwaits//改成等待第二張牌的狀態
        break
      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card)
        model.revealedCards.push(card)
        //判斷是否配對成功
        if (model.isRevealedCardsMatched()) {//paired successfully
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardsMatched
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()  //啟動遊戲結束時動畫
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else { //paired failed
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)  //配對失敗的動畫
          setTimeout(this.resetCards,2000)
        }
        break     
    }
    console.log('this.currentState:', this.currentState)
    console.log('revealedCards:', model.revealedCards)
  },
  resetCards(){
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  }

}

const utility = {//洗牌function
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1));
      [number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  },
}

controller.generateCards()

document.querySelectorAll('.card').forEach((card) => { //querySelectorAll+forEach增加多個監聽器
  card.addEventListener('click',event =>{
    return controller.dispatchCardAction(card)
  })
})

//console.log(flipCards(<div data-index= 8 class="card back"></div>))