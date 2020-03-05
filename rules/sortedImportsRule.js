"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Lint = require("tslint");
class Rule extends Lint.Rules.AbstractRule {
  apply(sourceFile) {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
  }
}
exports.Rule = Rule;
const failureMessage = (
  last,
  current
) => `Imports must be sorted from the most generic to the most specific.
--------------------------------------------------------------------------------
Note that:
  "${last}"
is more specific than:
  "${current}"
--------------------------------------------------------------------------------
The order should be:
1 - import globalStuff from "stuff";        // global stuff
2 - import farStuff    from "../../stuff";  // relative stuff
2 - import nearStuff   from "../stuff";     // relative stuff
3 - import localStuff  from "./stuff";      // local stuff
`;
const getDepth = s => {
  const count = s.split("/").filter(p => p == "..").length;
  if (count) return count + 1; // import "../stuff" == 2
  return s[0] == "."
    ? 1 // import "./stuff" == 1
    : Infinity; // import "stuff" == Infinity
};
const trimQuotes = /^['"](.*)['"]$/;
class Walker extends Lint.RuleWalker {
  constructor(sourceFile, options) {
    super(sourceFile, options);
    this.lastDepth = Infinity;
    this.lastImport = undefined;
  }
  visitImportDeclaration(node) {
    const text = node.moduleSpecifier.getText().replace(trimQuotes, "$1");
    const depth = getDepth(text);
    if (depth > this.lastDepth) {
      this.addFailure(
        this.createFailure(
          node.getStart(),
          node.getWidth(),
          failureMessage(this.lastImport, text)
        )
      );
    }
    this.lastImport = text;
    this.lastDepth = depth;
    super.visitImportDeclaration(node);
  }
}
