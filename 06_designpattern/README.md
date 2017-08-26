# Chapter6 디자인 패턴

> 디자인 패턴은 객체 지향적인 소프트웨어 설계에 관련된 일반적인 문제에 대한 해답을 제시했다. 특정 언어에 한정되거나 구현 방법이 정해져 있는 것은 아니다. 하지만 주로 C++, 자바와 같은 엄격한 자료형의 정적 클래스 기반 언어의 관점에서 많이 사용했다. 자바스크립트는 느스한 자료형의 동적 프로토타입 기반 언어이기 떄문에, 일부 디자인 패턴은 아주 간단하게 구현이 가능하다.

## 1. 싱글톤(singleton)

**싱글톤 패턴은 특정 클래스의 인스턴스를 오직 하나만 유지한다. 즉 동일한 클래스를 사용하여 새로운 객체를 생성하면, 두 번째부터는 처음 만들어진 객체를 얻게 된다.**

자바스크립트에는 클래스가 없고 오직 객체만 있다. 새로운 객체를 만들면 실제로 이 객체는 다른 객체와 다른 어떤 객체와도 같지 않기 때문에 이미 **싱글톤**이다.

따라서 싱글톤을 만들기 위한 별도의 문법이 존재하지 않는다고 할 수 있다.


``` js
// 객체 리터럴로 만든 단순한 객체 또는 싱글톤
var obj = {
  myprop: 'my value'
};

var obj2 = {
  myprop: 'my value'
};
obj === obj2; // false
obj == obj2; // false
```

### 1-1) new 사용하기

동일한 생성자로 `new`를 사용하여 여러 개의 객체를 만들 경우, 실제로는 동일한 객체에 대한 새로운 포인터만 반환하도록 구현하는 것이다.

*아래 예제들은 그다지 유용하지 않다.(클래스 기반 언어에서 설계 상의 문제를 우회하기 위한 방법)*

``` js
var uni = new Universe();
var uni2 = new Universe();
uni === uni2; // true
```

* `uni`는 생성자가 처음 호출되었을 때만 생성
* 두 번째(세 번재, 네번째 ...) 호출되었을 떄에는 동일한 `uni`객체가 반환 (`uni` === `uni2`)
* 객체의 인스턴스인 `this`가 생성되면 `Universe` 생성자가 이를 캐시한 후, 그 다음번에 생성자가 호출되었을 때 캐시된 인스턴스를 반환하게 하면 된다.
  * 인스턴스를 저장하기 위해 전역변수를 사용(전역 변수 사용하므로 추천하지 않는다.)
  * 생성자의 스태틱 프로퍼티에 인스턴스를 저장(`istance`프로퍼티가 공개되어 있기 때문에 외부에서 접근이 가능하다.)
  * 인스턴스를 클로저로 감싼다. (외부에서 접근 수정이 불가하나 클로저가 필요하다.)

### 1-2) 스태틱 프로퍼티에 인스턴스 저장하기

``` js
function Universe() {
  // 이미 instance가 존재 하는가?
  if (typeof Universe.instance === "object") { // istance가 있고 타입이 "object"이면 return 실행
    return Universe.instance;
  }

  this.start_time = 0;
  this.bang = "Big";

  // 인스턴스를 캐시한다.
  Universe.instance = this;

  return this; // 함축적인 반환?????????????????
}

var uni = new Universe();
var uni2 = new Universe();

uni === uni2; // true
```

간단하지만 `instace`가 공개되어 있다는 게 유일한 단점이다.

### 1-3) 클로저에 인스턴스 저장하기

5장에서 다루었던 비공개 스태틱 멤버 패턴을 사용

``` js
function Universe() {
  // 캐싱된 인스턴스
  var instance = this;

  this.start_time = 0;
  this.bang = "Big";

  // 생성자를 재작성
  Universe = function () {
    return instance;
  };

}

Universe.prototype.nothing = true;

var uni = new Universe();

Universe.prototype.everything = true;

var uni2 = new Universe();

console.log(uni.nothing); // true
console.log(uni2.nothing); // true
console.log(uni.everything); // undefined
console.log(uni2.everything); // undfined

console.log(uni.constructor.name); // Universe

console.log(uni.constructor === Universe); // false 원본 생성자를 가리키고 있다.
```

* 원본 생성자가 최초로 호출하면 일반적인 방식대로 `this`를 반환
* 두 번째, 세번쨰 혹은 그 이상이 되면 재작성된 생성자(클로저를 통해 비공개 `instance`변수에 접근하여 인스턴스를 반환)가 실행
* 4장에 `자기 자신을 정의하는 함수 패턴`을 사용했다. 따라서 재정의 시점 이전에 원본 생성자에 추가된 프로퍼티를 잃어버린다.

``` js
var Universe;

(function () {
  var instance;

  Universe = function Universe() {
    if (instance) {
      return instance;
    }

    instance = this;

    this.start_time = 0
    this.bang = "Big";
  };
}());

var uni = new Universe();
console.log(uni.bang);

Universe.prototype.nothing = true;
var uni = new Universe();
Universe.prototype.everything = true;
var uni2 = new Universe();

uni = uni2: // true

// 모든 프로토타입 프로퍼티가 언제 선언되었는지와 상관 없이 동작한다.
uni.nothing && uni.everything && uni2.nothing && uni2.everything; // true

uni.constructor === Universe;
```

## 2. 팩터리(Factory)

> 팩터리 패턴의 목적은 객체들을 생성하는 것이다. 팩터리 패턴은 흔히 클래스 내부에서 또는 클래스의 스태틱 메서드로 구현되며, 다음과 같은 목적으로 사용 된다.

* 비슷한 객체를 생성하는 반복작업을 수행
* 팩터리 패턴의 사용자가 컴파일 타임에 구체적인 타입(클래스)를 모르고도 객체를 생성할 수 있게 해준다.(컴파일언어에서는 어려우나 자바스크립트에서는 구현하기 쉽다.)

팩터리 메서드(또는 클래스)로 만들어진 객체들은 의도적으로 동일한 부모 개체를 상속한다. 즉, 이들은 특화된 기능을 구현하는 구체적인 서브 클래스들이다.

* `CarMaker` 생성자 : 공통의 부모
* `CarMaker.factory()` : `car`객체들을 생성하는 스태틱 메서드
* `CarMaker.Compact, CarMaker.SUV, CarMaker.Convertible` : `CarMaker`를 상속하는 특화된 생성자. 이 모두는 부모의 스태틱 프로퍼티로 정의되어 전역 네임스페이스를 꺠끗하게 유지하며, 필요할 때 쉽게 찾을 수 있다.

``` js
// 부모생성자
function CarMaker() { }

// 부모의 메서드
CarMaker.prototype.drive = function () {
  return "Vroom, I have " + this.doors + " doors";
};

// 스태틱 factory 메서드
CarMaker.factory = function (type) {
  var constr = type,
    newcar;

  // 생성자가 존재하지 않으면 에러
  if (typeof CarMaker[constr] !== "function") {
    throw {
      name: "Error",
      message: constr + " doesnt't exist"
    };
  }

  // 생성자의 존재를 확인했으므로 부모를 상속
  // 상속은 단 한번만 실행하도록 한다.

  if (typeof CarMaker[constr].prototype.drive !== "function") {
    CarMaker[constr].prototype = new CarMaker();
  }

  // 새로운 인스턴스를 생성
  newcar = new CarMaker[constr]();

  // 다른 메서드 호출이 필요하면 여기서 실행한 후, 인스턴스를 반환
  return newcar;
};

// 구체적인 자동차 메이커들를 선언한다.
CarMaker.Compact = function () {
  this.doors = 4;
};
CarMaker.Convertible = function () {
  this.doors = 2;
};
CarMaker.SUV = function () {
  this.doors = 24;
};

var corolla = CarMaker.factory('Compact'); // 이 메서드는 문자열로 타입을 받아 해당 타입의 객체를 생성하고 반환(생성자)
var solstice = CarMaker.factory('Convertible');
var cherokee = CarMaker.factory('SUV');

corolla.drive(); // "Vroom, I have 4 doors"
solstice.drive();// "Vroom, I have 2 doors"
cherokee.drive();// "Vroom, I have 24 doors"
```

### 내장 객체 팩터리

전역 `Object()` 생성자도 입력 값에 따라 다른 객체를 생성하기 때문에 팩터리처럼 동작한다고 할 수 있다.

``` js
var o = new Object(),
    n = new Object(1),
    s = Object('1'),
    b = object(true);

// 테스트
o.constructor === Object; // true
n.constructor === Number; // true
s.constructor === String; // true
n.constructor === Boolean; // true
```

## 3. 반복자(iterator)

> 반복자 패턴에서, 객체는 일종의 집합적인 데이터를 가진다. 데이터가 저장된 내부 구조는 복잡하더라도 개별 요소에 쉽게 접근할 방법이 필요할 것이다.

* `next()` : 데이터 구조 내에서 다음 순서를 호출하여 개별 데이터 요소에 접근
* `hasNext()` : 데이터 구조(집합, 배열)에서 마지막인지 아닌지를 구분
* `rewind()` : 포인터를 다시 처음으로 되돌린다.
* `current()` : 현재 요소를 반환한다.


``` js
var agg = (function () {
  var index = 0,
      data = [1,2,3,4,5],
      length = data.length;

  return {
    next: function () {
      var element;
      if (!this.hasNext()) {
        return null;
      }
      element = data[index];
      index = index + 2;
      return element;
    },

    hasNext: function() {
      return index < length;
    },

    rewind: function() {
      index = 0;
    },

    current: function() {
      return data[index];
    }
  }
}());

while (agg.hasNext()) {
  console.log(agg.next());
}

agg.rewind();
console.log(agg.current()); // 1
```

## 4. 장식자(Decorator)

> 장식자 패턴을 이용하면 런타임시 부가적인 기능을 객체에 동적으로 추가할 수 있다.(역시 자바스크립트에서는 쉽게 구현이 가능)

기본 몇가지 기능을 가진 평범한 객체에서 사용가능한 장식자들을 객체에 기능을 덧붙여 간다.

``` js
var sale = new Sale(100); // 가격은 100달러
sale = sale.decorate('fedtax'); // 연방세 추가
sale = sale.decorate('quebec'); // 지방세 추가
sale = sale.decorate('money'); // 통화 형식 지정
sale.getPrice(); // "$112.88"
```

새로운 객체 `sale`객체에 연방세 추가(장식자 기능) -> 지방세 추가(장식자 기능) -> 통화 형식 지정(장식자 기능)


### 4-1) 장식자 구현

``` js
function Sale(price) {
  this.price = price || 100;
}

Sale.prototype.getPrice = function () {
  return this.price;
};

Sale.decorators = {};

Sale.decorators.fedtax = {
  getPrice: function () {
    var price = this.uber.getPrice();
    price += price * 5 / 100;
    return price;
  }
};

Sale.decorators.quebec = {
  getPrice: function () {
    var price = this.uber.getPrice();
    price += price * 7.5 / 100;
    return price;
  }
};

Sale.decorators.money = {
  getPrice: function () {
    return "$" + this.uber.getPrice().toFixed(2);
  }
}

Sale.decorators.cdn = {
  getPrice: function () {
    return "CDN$ " + this.uber.getPrice().toFixed(2);
  }
}

Sale.prototype.decorate = function (decorator) {
  var F = function () {},
      overrides = this.constructor.decorators[decorator],
      i, newobj;
  F.prototype = this;
  newobj = new F();
  newobj.uber = F.prototype;
  for ( i in overrides ) {
    if (overrides.hasOwnProperty(i)) {
      newobj[i] = overrides[i];
    }
  }
  return newobj;
}

var sale = new Sale(100); // 가격은 100달러
sale = sale.decorate('fedtax'); // 연방세 추가
sale = sale.decorate('quebec'); // 지방세 추가
sale = sale.decorate('money'); // 통화 형식 지정
sale.getPrice(); // "$112.88"

```

* `sale.getPrice()` 실행하면 `money`장식자를 실행하는것 괕다.
* money->quebec->fedtax->Sale.prototype.getPrice()까지 간다.

### 목록을 사용한 구현

* 자바스크립트의 동적 특성을 최대한 활용하며 상속은 전혀 사용하지 않는다.
* 각각의 꾸며진 메서드가 체인 안에 있는 이전의 메서드를 호출하는 대신에, 간단하게 이전 메서드의 결과를 다음 메서드에 매겨변수로 전달

``` js
function Sale(price) {
  this.price = (price > 0) || 100;
  this.decorators._list = [];
}

Sale.decorators = {};

Sale.decorators.fedtax = { // 중간 결과 값을 가져오기 위해 부모의 `getPrice()`호출할 필요가 없다.
  getPrice: function (price) {
   return price + price * 5 / 100;
  }
};

Sale.decorators.quebec = {
  getPrice: function (price) {
   return price + price * 7.5 / 100;
  }
};

Sale.decorators.money = {
  getPrice: function (price) {
   return "$" + price.toFixed(2);
  }
};

Sale.prototype.decorate = function (decorator) {
  this.decorators_list.push(decorator);
}

Sale.prototype.getPrice = function() { // 장식되기를 허용한 유일한 메서드
  var price = this.price,
  i,
  max = this.decorators_list.length,
  name;

  for ( i = 0; i < max; i += 1 ) { // 더 많은 메서드를 장식하고 싶다면, 추가되는 메서드에도 모두 장식자 목록을 순회하는 이부분이 반복해서 들어가야 한다.
   name = this.decorators_list[i];
   price = Sale.decoratorsp[name].getPrice(price);
  }

  return price;
```

## 5. 전략 패턴

> 런타임에 알고리즘을 선택할 수 있게 해준다. 사용자는 동일한 인터페이스를 유지하면서, 특정한 작업을 처리할 알고리즘을 여러 가지 중에서 상황에 맞게 선택할 수 있다.

### 데이터 유효성 검사 예제

`validate()` 메서드를 가지는 `validator`객체를 만든다. 이 메서드는 폼의 특정한 타입에 관계 없이 호출되고, 항상 동일 한결과, 즉 유효성 검사를 통과하지 못한 데이터 목록과 함께 에러를 반환한다.
그러나 사용자는 구체적인 폼과 검사할 데이터에 따라서 다른 종류 검사 방법을 선택할 수도 있다. 유효서 검사기가 작업을 처리할 최선의 `전략`을 선택하고, 그에 해당하는 적절한 알고리즘에 실질적인 데이터 검증 작업을 위임한다.

``` js
var validator = {
  // 사용할 수 잇는 모든 검사 방법들
  types: {},

  // 현재 유효성 검사 세션의 여러 메시지들
  messages: [],

  // 현재 유효성 검사 설정
  // '데이터 필드명: 사용할 검사 방법'의 형식'
  config: {},

  // 인터페이스 메서드
  // 'data'는 이름 => 값, 쌍이다.
  validate: function (data) {
    var i, msg, type, checker, result_ok;

    // 모든 메시지를 초기화한다.
    this.messages = [];

    for ( i in data) {
      if( data.hasOwnProperty(i)) {

        type = this.config[i];
        checker = this.types[type];

        if(!type) {
          continue;
        }
        if (!checker) {
          throw {
            name: "validationError",
            message: type + '값을 처리할 유효성 검사기가 존재하지 않습니다.'
          };
        }

        result_ok = checker.validate(data[i]);
        if (!result_ok) {
          msg = "\'" + i + "\' 값이 유효하지 않습니다." + checker.instructions;
        }
      }
    }
    return this.hasErros();
  },

  // 도우미 메서드
  hasErros: function () {
    return this.message.length !== 0;
  }
};

var data = {
  first_name: "Super",
  last_name: "Man",
  age: "unknown",
  username: "o_O"
};

validator.config = {
  first_name: 'isNonEmpty',
  age: 'isNumber',
  username: 'isAlphaNum'
};

validator.validate(data);
if (validator.hasErros()) {
  console.log(validator.message.join("\n"));
}

// 값을 가지는 확인

validator.types.isNonEmpty = {
  validate: function (value) {
    return value !== "";
  },
  instructions: "이 값은 필수입니다."
};

//숫자 값인지 확인
validator.types.isNumber = {
  validate: function (value) {
    return !isNaN(value);
  },
  instructions: "숫자만 사용할 수 있습니다. 예: 1, 3.14 or 2010"
};

// 값이 문자와 숫자로만 이루어졌는지 확인한다.
validator.types.isAlphaNum = {
  validate: function (value) {
    return !/[^a-z0-9]/i.test(value);
  },
  instructions: "특수 문자를 제외한 글자와 숫자만 사용할 수 있습니다."
};
```
