import {
  NodeSelector,
  buildGraph,
  shorttenArr,
  getPaths,
  flat,
  Logger,
  writeFileSync,
} from "../../lib/utils";

const path = require("path");

//
export { command, aliases, describe, builder, handler, deprecated };
// string (or array of strings) that executes this command when given on the command line, first string may contain positional args
const command = "top-order [dirs..]";
// array of strings (or a single string) representing aliases of exports.command, positional args defined in an alias are ignored
const aliases = ["dep [dirs..]", "deptree [dirs..]", "torder [dirs..]"];
//string used as the description for the command in help text, use false for a hidden command
const describe = "generate the topological order from dependencies chain";
//object declaring the options the command accepts, or a function accepting and returning a yargs instance
const builder = (yargs) => {
  return yargs
    .positional("dirs", {
      describe:
        "dirs to look up modules (where package.json files are located)",
      type: "array",
      default: [process.cwd()],
    })
    .option("ignore", {
      type: "array",
      description: "An array of dirs to ignore",
      default: [],
    })
    .option("prefixes", {
      alias: "p",
      type: "array",
      description: "prefixes of interested modules to select",
      default: ["pkg"],
    })
    .option("series", {
      alias: "s",
      type: "boolean",
      description: "merge the output into a seri",
      default: false,
    });
};
const deprecated = false; // a boolean (or string) to show deprecation notice.
//// a function which will be passed the parsed argv.
const handler = async (opts) => {
  let { dirs, prefixes, ignore } = opts;
  let loggy = Logger();

  loggy.info("looking up modules under", dirs);
  loggy.info(`prefixes=${prefixes}`);
  loggy.info(`ignore=${ignore}`);

  let paths = await getPaths(dirs, ignore);

  let G = buildGraph(paths, NodeSelector(prefixes));

  G.print();

  let build_order = G.overallOrder();

  !opts.fullOutput && shorttenArr(build_order);

  let output = JSON.stringify(
    opts.series ? flat(build_order) : build_order,
    null,
    2
  );

  if (opts.out) {
    writeFileSync(opts.outPath, output);
  }

  loggy.log(output);
};
