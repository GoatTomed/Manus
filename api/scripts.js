import { Buffer } from "buffer";
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
    // Fonction pour lire le script Lua
    const getLuaScript = () => {
        try {
            const filePath = path.join(process.cwd(), 'api', 'script.lua');
            return fs.readFileSync(filePath, 'utf8');
        } catch (err) {
            return "-- Error loading script: " + err.message;
        }
    };

    // On sert directement le script Lua sans vérification de mot de passe
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).send(getLuaScript());
}
