"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const Lint = require("tslint");
const FAILURE_STRING = `_() should be called with a single string literal argument.

  If you need to localize an expression or interpolated string,
  localize the components of the expression instead:

    _("abc" + stuff)

  becomes:

    _("abc") + stuff

  or use the following pattern:

    _("abc XX").replace("XX", stuff)

  for interpolation:

    _(\`abc \${stuff}\`)

  becomes:

    \`\${_("abc")} \${stuff}\`

  `;
class Rule extends Lint.Rules.AbstractRule {
  apply(sourceFile) {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
  }
}
exports.Rule = Rule;
class Walker extends Lint.RuleWalker {
  constructor(sourceFile, options) {
    super(sourceFile, options);
    this.walker = null;
  }
  visitCallExpression(node) {
    const fn = node.expression.getText();
    if (fn === "_") {
      if (
        node.arguments.length !== 1 ||
        node.arguments[0].kind != ts.SyntaxKind.StringLiteral
      ) {
        this.fail(node);
      }
    }
    this.walkChildren(node);
  }
  fail(node) {
    this.addFailure(
      this.createFailure(node.getStart(), node.getWidth(), FAILURE_STRING)
    );
  }
}
