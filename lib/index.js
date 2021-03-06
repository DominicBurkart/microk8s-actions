"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const sh = __importStar(require("shelljs"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        let channel = core.getInput("channel");
        let rbac = core.getInput("rbac");
        let dns = core.getInput("dns");
        let storage = core.getInput("storage");
        console.log("install microk8s..");
        sh.exec("sudo snap install microk8s --classic --channel=" + channel);
        waitForReadyState();
        prepareUserEnv();
        enableOrDisableRbac(rbac);
        enableOrDisableDns(dns);
        enableOrDisableStorage(storage);
    });
}
function waitForReadyState() {
    return __awaiter(this, void 0, void 0, function* () {
        let ready = false;
        while (!ready) {
            yield delay(2000);
            let code = sh.exec("sudo microk8s status --wait-ready", { silent: true }).code;
            if (code === 0) {
                ready = true;
                break;
            }
        }
    });
}
function prepareUserEnv() {
    // Create microk8s group
    console.log("creating microk8s group.");
    sh.exec("sudo usermod -a -G microk8s $USER");
    console.log("creating default kubeconfig location.");
    sh.exec("mkdir -p '/home/runner/.kube/'");
    console.log("Generating kubeconfig file to default location.");
    sh.exec("sudo microk8s kubectl config view --raw > $HOME/.kube/config");
    console.log("Change default location ownership.");
    sh.exec("sudo chown -f -R $USER $HOME/.kube/");
}
function enableOrDisableRbac(rbac) {
    // Enabling RBAC
    if (rbac.toLowerCase() === "true") {
        console.log("Start enabling RBAC.");
        waitForReadyState();
        sh.exec("sudo microk8s enable rbac");
        waitForReadyState();
    }
}
function enableOrDisableDns(dns) {
    if (dns.toLowerCase() === "true") {
        console.log("Start enabling dns.");
        waitForReadyState();
        sh.exec("sudo microk8s enable dns");
        waitForReadyState();
    }
}
function enableOrDisableStorage(storage) {
    if (storage.toLowerCase() === "true") {
        console.log("Start enabling storage.");
        waitForReadyState();
        sh.exec("sudo microk8s enable storage");
        waitForReadyState();
    }
}
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
run();
