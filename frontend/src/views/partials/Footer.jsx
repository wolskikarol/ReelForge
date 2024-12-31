import React from "react";

function Footer() {
    return (
        <footer style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#1d1a23"
        }}>
            <div className="footer-left">
                <p style={{ color: "#f5f1e3", textAlign: "center", margin: 0 }}>
                    2024 ReelForge
                </p>
            </div>
        </footer>
    );
}

export default Footer;
