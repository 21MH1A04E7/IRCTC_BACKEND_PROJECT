const crypto=require('crypto');

function getDeviceFringerprint(req){
    const userAgent=req.header["user-agent"] || "";
    const ip=req.ip || "";
    const accept=req.header["accept"] || "";

    const raw =`${userAgent}|${ip}|${accept}`;
    return crypto.createHash("sha256")
        .update(raw)
        .digest("hex")
        .slice(0,16) // short id
}

module.exports={
    getDeviceFringerprint
}