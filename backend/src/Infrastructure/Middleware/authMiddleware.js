const jwt = require('jsonwebtoken');

/**
 * Middleware skirta verifikuoti JWT tokeną
 * Iššifruotą informaciją prikabina prie užklausos objekto
 */
const authorizeUser = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    const token = authHeader && authHeader.split(' ');

    if (!token || token[0] !== 'Bearer' || !token[1]) {
        return res.status(401).json({
            error: "Prieiga uždrausta. Nerastas autorizacijos raktas (Token)."
        });
    }

    try {
        const decoded = jwt.verify(token[1], process.env.JWT_SECRET);
        req.user = {
            id: decoded.userId,
            role: decoded.role
        };
        next();

    } catch (err) {
        console.error("JWT Verifikacijos klaida:", err.message);
        return res.status(403).json({
            error: "Sesija nebegalioja arba raktas neteisingas. Prašome prisijungti iš naujo."
        });
    }
};

module.exports = authorizeUser;