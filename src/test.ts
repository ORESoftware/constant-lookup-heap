"use strict";

import {MinHeap, Value} from "./main";
import * as util from "util";

const mh = new MinHeap();

export class Boop implements Value {

  val: number;

  constructor(val: number) {
    this.val = val;
  }

  getCompareValue(): number {
    return this.val;
  }

}

mh.add("star", new Boop(7));
mh.add("foo", new Boop(4));
mh.add("bar", new Boop(6));
mh.add("ggg", new Boop(-3));

// mh.add("ggg", new Boop(3));
// mh.add("foo", new Boop(4));
// mh.add("bar", new Boop(6));
// mh.add("star", new Boop(7));



// mh.add("xzz", new Boop(-1));

// console.log(util.inspect(mh, { depth: 30 }));

console.log(util.inspect(mh.readMin(), {depth: 30}));

console.log(util.inspect(mh.readMax(), {depth: 30}));
