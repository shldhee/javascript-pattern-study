
## 7. 객체 상수

ES5이하에서는 상수가 없지만 ES6부터는 `const` 문을 통해 상수를 생성할 수 있다.
명명 규칙을 사용하여 값이 변경되지 말아야 하는 변수명을 모두 대문자로 쓴다.
이 규칙은 실제로 자바스크립트 내장객체에서도 사용된다.

``` js
Math.PI; // 3.1415...
Math.SQRT2; // 1.4142...
Number.MAX_VALUE; // 1.7976.....
```

사용자 정의 상수에도 동일한 명명 규칙을 적용하여, 생성자 함수에 스태틱 프로퍼티로 추가하면 된다.

``` js
// 생성자
var Widget = function () {
	// 생성자의 구현내용...
};

// 상수

Widget.MAX_HEIGHT = 320;
Widget.MAX_WIDTH = 480;
```

객체 리터럴로 생성한 객체에도 동일한 명명 규칙을 적용할 수 있다.
**즉 대문자로 쓴 일반적인 프로퍼티를 상수로 간주하는 것이다.**

실제로도 값이 변경되지 않게 하고 싶다면, 비공개 프로퍼티를 만든 후, 값을 설정하는 메서드(`setter`)없이 값을 반환하는 메서드(`getter`)만 제공하는 방법도 고려해볼 만하다. 그러나 대부분의 경우 명명 규칙만으로도 충분하다.

다음 예제는 아래 메서드를 제공하는 범용 `constant` 객체를 구현한 것이다.
***`sum(name, value)`***
새로운 상수를 정의한다.

***`isDefined(name)`***
특정 이름의 상수가 있는지 확인한다.

***`get(name)`***
상수의 값을 가져온다.

* 상수 값을 원세 데이터 타입만 허용
* 선언하려는 상수의 이름이 `toString`,`hasOwnProperty` 등 내장 프로퍼티의 이름과 겹치지 않도록 보장
* 모든 상수의 이름 앞에 임의로 생성된 접두어 붙인다.

``` js
var constant = (function () {
	var constants = {},
	    ownProp = Object.prototype.hasOwnProperty,
			allowed = {
				string: 1,
				number: 1,
				boolean: 1
			},
			prefix = (Math.random() + "_").slice(2);
	return {
		set: function (name, value) {
			if (this.isDefined(name)) {
				return false;
			}
			if (!ownProp.call(allowed, typeof value)) { //궁금...? 어떤걸 넣어도 다 되는거 같은데..
				return false;
			}
			constants[prefix + name] = value;
			return true;
		},
		isDefined: function (name) {
			return ownProp.call(constants, prefix + name);
		},
		get: function (name) {
			if (this.isDefined(name)) {
				return constants[prefix + name];
			}
			return null;
		}
	};
}());
constant.isDefined("maxwidth");
constant.set("maxwidth");
constant.isDefined("maxwidth");
constant.get("maxwidth");
```

## 8. 체이닝 패턴

**체이닝 패턴이란 객체에 연쇄적으로 메서드를 호출할 수 있도록 하는 패턴이다.** 즉 여러 가지 동작을 수행할 때, 먼저 수행한 동작의 반환 값을 변수에 할당한 후 다음작업을 할 필요가 없기 때문에, 호출을 여러 줄에 걸쳐 쪼개지 않아도 된다.

``` js
myobj.method1("hello").method2().method3("world").method4();
```

만약 메서드에 의미있는 반환 값이 존재하지 않는다면, 현재 작업중인 객체 인스터스인 `this`를 반환하게 한다. 이렇게 하면 객체의 사용자는 앞선 메서드에 이어 다음 메서드를 바로 호출할 수 있다.

``` js
var obj = {
	  value: 1,
		increment: function() {
			this.value++;
			return this;
		},
		add: function (v) {
			this.value += v;
			return this;
		},
		shout: function () {
			alert(this.value);
		}
};

// 메서드 체이닝 호출
obj.increment().add(3).shout();
```

### 8-1) 체이닝 패턴의 장단점

#### 장점

1. 코드량이 줄고 코드가 간결해져 하나의 문장처럼 읽을 수 있다.
2. 함수를 쪼개는 방법을 생각하게 된다.
3. 장기적으로 유지보수에 유리하다

#### 단점

1. 디버깅하기가 어렵다. 라인은 발견할 수 있으나 그 라인에 수많은 일이 있다.

어쨌든 이 패턴을 알아두면 좋다.
**어떤 메서드가 명백히 의미있는 반환 값을 가지지 않는다면 항상 `this`를 반환하게 한다.**
이 패턴은 `jQuery`라이브리러 등에서 사용된다.
`DOM API`를 보면, `DOM`의 요소들도 체이닝 패턴을 사용하는 경향이 있다.

``` js
document.getElementByTagName('head')[0].appendChild(newnode);
```

## 9. method() 메서드

예제도 안되고 안쓰는듯?

생성자 본문 내에서 인스턴스 프로퍼티를 추가할 수 있다는 점에서, 생성자 함수의 사용법은 자바에서 클래스를 사용하는 것과 비슷하다. 그러나 `this`에 인스턴스 메서드를 추가하게 되면 인스턴스마다 메서드가 재생성되어 메모리를 잡아 먹으므로 비효율적이다.

**따라서 재사용 가능한 메서드는 생성자의 `prototype` 프로퍼티에 추가되어야 한다.**
그런데 `prototype`이 다른 개발자들에게는 낯선 개념일수 있기 때문에, `method()`라는 메서드 속에 숨겨두는 것이다.

***언어에 장식적으로 추가한 달콤한 편의 기능을 가리켜 종종 `문법 설탕`***
여기서는 `method()`라는 메서드를 `설탕 메서드`라고 할 수 있다.

`method()`라는 문법 설탕을 사용해 '클래스'를 정의하는 방법

``` js
var Person = function (name) {
	this.name = name;
}.
	method('getName', function () {
	  return this.name;
}).
	method('setName', function (name) {
		this.name = name;
		return this.
	});
```

생략

## 10. 요약

**객체 리터럴과 생성자 함수에서 더 나아가 객체를 생성하는 다양한 패턴들을 살펴보았다.**

* 전역 공간을 꺠끗하게 유지하고 코드를 구조화하여 정리하도록 도와주는 **네임스페이스 패턴**
* 간단하면서도 놀랄 만큼 유용한 **의존 관계 선언 패턴**
* **비공개 패턴**을 보면서 비공개 멤버, 특권 메서드, 비공개 멤버를 구현할 때 신경써야 할 경우들, 객체 리터럴을 사용하면서 비공개 멤버를 구현하는 방법, 비공개 메서드를 공개 메서드처럼 노출하는 방법 등을 다루었다.
* 긴 네임스페이스의 대안으로 **샌드박스 패턴**
* 객체 상수, 공개/비공개 스태틱 멤버, 체이닝 패턴

## 11. 의문점

1. 샌드박스 패턴
2.
