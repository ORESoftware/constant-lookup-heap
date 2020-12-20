'use strict';

import {MinHeap} from "./main";
import * as util from 'util';

const mh = new MinHeap()

mh.add("foo", {
  getValue(): number {
    return 4;
  }}
  )

mh.add("bar", {
  getValue(): number {
    return 6;
  }}
)

mh.add("star", {
  getValue(): number {
    return 6;
  }}
)

mh.add("ggg", {
  getValue(): number {
    return 3;
  }}
)

console.log(util.inspect(mh, {depth: 30}))


