'use strict';

export const r2gSmokeTest = function () {
  // r2g command line app uses this exported function
  return true;
};

export interface Value {
  getValue(): number;
}

class Wrapper<V extends Value> {

  leftChild: Wrapper<V>
  rightChild: Wrapper<V>
  parent: Wrapper<V>
  val: V

  constructor(val: V) {
    this.val = val;
  }

  getValue(){
    return this.val.getValue()
  }

}

export class MinHeap<Key, V extends Value> {

  map = new Map<Key, V>()
  root: Wrapper<V> = null as Wrapper<V>;
  toe: Wrapper<V> = null as Wrapper<V>;

  private swapLeft(child: Wrapper<V>, parent: Wrapper<V>){

    if(parent.leftChild !== child){
      throw 'implementation error 3'
    }

    child.leftChild = parent;
    child.parent = parent.parent;
    const crc = child.rightChild;
    child.rightChild = parent.rightChild
    parent.rightChild = crc;
    parent.parent = child;

  }

  private swapRight(child: Wrapper<V>, parent: Wrapper<V>){

    if(parent.rightChild !== child){
      throw 'implementation error 2'
    }


  }

  private bubbleUp(w: Wrapper<V>){

    if(w.parent === null){
      return;
    }

    if(w.parent.getValue() <= w.getValue()){
      return;
    }

    if(w.parent.leftChild === w){
      this.swapLeft(w, w.parent)
    } else if(w.parent.rightChild === w){
      this.swapRight(w, w.parent)
    }
    else {
      throw 'implementation error 1'
    }

    this.bubbleUp(w);

  }

  add(k: Key, v: V): boolean {

    if(this.map.has(k)){
      throw `map already has key '${k}'`
    }

    this.map.set(k, v)
    const w = new Wrapper<V>(v)

    if(this.root === null){
      this.root = this.toe = w;
      return true;
    }

    if(!this.toe.leftChild){
      this.toe.leftChild = w;
      w.parent = this.toe.leftChild;
    }
    else if(!this.toe.rightChild){
      this.toe.rightChild = w;
      w.parent = this.toe.rightChild;
    }



  }

  removeByKey(k: Key){

  }

  removeMax(){

  }

  removeMin(){

  }

  lookup(k: Key): V{
    return this.map.get(k) as V
  }



}



