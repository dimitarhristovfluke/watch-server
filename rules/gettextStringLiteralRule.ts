import * as ts from "typescript";
import * as Lint from "tslint";

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

export class Rule extends Lint.Rules.AbstractRule {
  public apply(sourceFile: ts.SourceFile) {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
  }
}
class Walker extends Lint.RuleWalker {
  walker: Lint.RuleWalker = null;
  constructor(sourceFile: ts.SourceFile, options: Lint.IOptions) {
    super(sourceFile, options);
  }
  public visitCallExpression(node: ts.CallExpression) {
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
  private fail(node: ts.CallExpression) {
    this.addFailure(
      this.createFailure(node.getStart(), node.getWidth(), FAILURE_STRING)
    );
  }
}
