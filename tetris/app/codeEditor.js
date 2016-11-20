System.register([], function (exports_1, context_1) {
    "use strict";
    var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments)).next());
        });
    };
    var __generator = (this && this.__generator) || function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
        return { next: verb(0), "throw": verb(1), "return": verb(2) };
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [0, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };
    var __moduleName = context_1 && context_1.id;
    var CodeEditor;
    return {
        setters: [],
        execute: function () {
            CodeEditor = (function () {
                function CodeEditor() {
                    var _this = this;
                    var editor;
                    require.config({ paths: { 'vs': 'libs/monaco/min/vs' } });
                    require(['vs/editor/editor.main'], function () { return __awaiter(_this, void 0, void 0, function () {
                        var text, defaultApp;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, window.fetch('app/tetris.d.ts')];
                                case 1: return [4 /*yield*/, (_a.sent()).text()];
                                case 2:
                                    text = _a.sent();
                                    return [4 /*yield*/, window.fetch('app/tetrisGame.ts')];
                                case 3: return [4 /*yield*/, (_a.sent()).text()];
                                case 4:
                                    defaultApp = _a.sent();
                                    monaco.languages.typescript.typescriptDefaults.addExtraLib(text, 'app/tetris.d.ts');
                                    editor = monaco.editor.create(document.getElementById('container'), {
                                        value: defaultApp,
                                        language: 'typescript',
                                    });
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    window.runCode = function () {
                        var game = editor.getValue();
                        var sourceFile = ts.createSourceFile("game.ts", game, ts.ScriptTarget.ES5);
                        var outputText;
                        var program = ts.createProgram(["game.ts"], {}, {
                            getSourceFile: function (fileName) {
                                return fileName.indexOf("game.ts") === 0 ? sourceFile : undefined;
                            },
                            writeFile: function (_name, text) {
                                console.log(outputText = text);
                            },
                            getDefaultLibFileName: function () {
                                return "lib.d.ts";
                            },
                            useCaseSensitiveFileNames: function () {
                                return false;
                            },
                            getCanonicalFileName: function (fileName) {
                                return fileName;
                            },
                            getCurrentDirectory: function () {
                                return "";
                            },
                            getNewLine: function () {
                                return "\r\n";
                            },
                            fileExists: function (fileName) {
                                return fileName === "game.ts";
                            },
                            readFile: function () {
                                return "";
                            },
                            directoryExists: function () {
                                return true;
                            },
                            getDirectories: function () {
                                return [];
                            }
                        });
                        // Emit
                        program.emit();
                        var exports = { TetrisAI: null };
                        window.eval(outputText);
                        new exports.TetrisAI();
                    };
                }
                return CodeEditor;
            }());
            exports_1("CodeEditor", CodeEditor);
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZUVkaXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNvZGVFZGl0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBUUE7Z0JBQ0k7b0JBQUEsaUJBOERDO29CQTdERyxJQUFJLE1BQTZCLENBQUM7b0JBQ2xDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBQyxLQUFLLEVBQUUsRUFBQyxJQUFJLEVBQUUsb0JBQW9CLEVBQUMsRUFBQyxDQUFDLENBQUM7b0JBQ3RELE9BQU8sQ0FBQyxDQUFDLHVCQUF1QixDQUFDLEVBQUU7NEJBQzNCLElBQUksRUFDSixVQUFVOzs7d0NBREksTUFBTSxlQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsRUFBQTt3Q0FBNUMsTUFBTSxlQUFBLFdBQXVDLENBQUMsSUFBSSxFQUFFLEVBQUE7OztvQ0FDdkMsTUFBTSxlQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsRUFBQTt3Q0FBOUMsTUFBTSxlQUFBLFdBQXlDLENBQUMsSUFBSSxFQUFFLEVBQUE7OztvQ0FFdkUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsa0JBQWtCLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO29DQUVwRixNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsRUFBRTt3Q0FDaEUsS0FBSyxFQUFFLFVBQVU7d0NBQ2pCLFFBQVEsRUFBRSxZQUFZO3FDQUN6QixDQUFDLENBQUM7Ozs7eUJBRU4sQ0FBQyxDQUFDO29CQUVHLE1BQU8sQ0FBQyxPQUFPLEdBQUc7d0JBQ3BCLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQzt3QkFFN0IsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQzt3QkFDM0UsSUFBSSxVQUFVLENBQUM7d0JBQ2YsSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFDLGFBQWEsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsRUFBRTs0QkFDNUMsYUFBYSxFQUFFLFVBQUMsUUFBUTtnQ0FDcEIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLFVBQVUsR0FBRyxTQUFTLENBQUM7NEJBQ3RFLENBQUM7NEJBQ0QsU0FBUyxFQUFFLFVBQUMsS0FBSyxFQUFFLElBQUk7Z0NBQ25CLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxDQUFDOzRCQUNuQyxDQUFDOzRCQUNELHFCQUFxQixFQUFFO2dDQUNuQixNQUFNLENBQUMsVUFBVSxDQUFDOzRCQUN0QixDQUFDOzRCQUNELHlCQUF5QixFQUFFO2dDQUN2QixNQUFNLENBQUMsS0FBSyxDQUFDOzRCQUNqQixDQUFDOzRCQUNELG9CQUFvQixFQUFFLFVBQUMsUUFBUTtnQ0FDM0IsTUFBTSxDQUFDLFFBQVEsQ0FBQzs0QkFDcEIsQ0FBQzs0QkFDRCxtQkFBbUIsRUFBRTtnQ0FDakIsTUFBTSxDQUFDLEVBQUUsQ0FBQzs0QkFDZCxDQUFDOzRCQUNELFVBQVUsRUFBRTtnQ0FDUixNQUFNLENBQUMsTUFBTSxDQUFDOzRCQUNsQixDQUFDOzRCQUNELFVBQVUsRUFBRSxVQUFDLFFBQVE7Z0NBQ2pCLE1BQU0sQ0FBQyxRQUFRLEtBQUssU0FBUyxDQUFDOzRCQUNsQyxDQUFDOzRCQUNELFFBQVEsRUFBRTtnQ0FDTixNQUFNLENBQUMsRUFBRSxDQUFDOzRCQUNkLENBQUM7NEJBQ0QsZUFBZSxFQUFFO2dDQUNiLE1BQU0sQ0FBQyxJQUFJLENBQUM7NEJBQ2hCLENBQUM7NEJBQ0QsY0FBYyxFQUFFO2dDQUNaLE1BQU0sQ0FBQyxFQUFFLENBQUM7NEJBQ2QsQ0FBQzt5QkFDSixDQUFDLENBQUM7d0JBQ0gsT0FBTzt3QkFDUCxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7d0JBQ2YsSUFBSSxPQUFPLEdBQUcsRUFBQyxRQUFRLEVBQUUsSUFBSSxFQUFDLENBQUM7d0JBQ3pCLE1BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7d0JBQy9CLElBQUksT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFBO29CQUMxQixDQUFDLENBQUM7Z0JBQ04sQ0FBQztnQkFDTCxpQkFBQztZQUFELENBQUMsQUFoRUQsSUFnRUM7O1FBQUEsQ0FBQyJ9