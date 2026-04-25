import React from 'react';

export default function Footer({ 
    onLogoClick, 
    onNavClick 
}: { 
    onLogoClick?: () => void,
    onNavClick?: (view: 'landing' | 'app' | 'vitrin' | 'community' | 'pricing' | 'about' | 'tools' | 'typography') => void
}) {

    return (
        <footer className="footer-root">
            <style>{`
                .footer-root {
                    position: relative;
                    width: 100%;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    border-top-left-radius: 32px;
                    border-top-right-radius: 32px;
                    box-sizing: border-box;
                    background: #0a0a0d;
                }

                .footer-container {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    justify-content: flex-start;
                    flex: 1 0 0;
                    width: 100%;
                    border-radius: 32px;
                    overflow: hidden;
                    gap: 120px;
                    padding: 112px 148px 0;
                    box-sizing: border-box;
                    z-index: 2;
                }

                .footer-bg {
                    position: absolute;
                    inset: 0;
                    z-index: 0;
                    opacity: 0.8;
                }
                .footer-bg img {
                    display: block;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .footer-top {
                    z-index: 2;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    width: 100%;
                    position: relative;
                }

                .footer-menu-row {
                    display: flex;
                    flex-direction: row;
                    align-items: flex-start;
                    gap: 64px;
                    width: 100%;
                }

                .footer-menu-col {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 16px;
                    flex: 1;
                    max-width: 264px;
                }

                .footer-cat-title {
                    font-family: 'Inter', sans-serif;
                    font-size: 14px;
                    font-weight: 500;
                    color: rgba(255, 255, 255, 0.4);
                    margin: 0;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                }

                .footer-link-list {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 8px;
                    width: 100%;
                }

                .footer-link {
                    background: none;
                    border: none;
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    cursor: pointer;
                    text-decoration: none;
                    position: relative;
                }

                .footer-link-text {
                    font-family: 'Cal Sans', 'Inter', sans-serif;
                    font-size: 24px;
                    font-weight: 600;
                    line-height: 1.2;
                    color: rgb(255, 255, 255);
                    margin: 0;
                    transition: color 0.3s ease;
                }

                .footer-link:hover .footer-link-text {
                    color: #ff4d00;
                }

                .footer-bottom {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;
                    position: relative;
                    z-index: 2;
                    margin-top: 40px;
                }

                .footer-content-row {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    justify-content: space-between;
                    width: 100%;
                    padding-bottom: 24px;
                }

                .footer-copyright {
                    font-family: 'Inter', sans-serif;
                    font-size: 14px;
                    color: rgba(255, 255, 255, 0.4);
                    margin: 0;
                }

                .footer-backtotop {
                    font-family: 'Inter', sans-serif;
                    font-size: 14px;
                    font-weight: 600;
                    color: #ff4d00;
                    background: none;
                    border: none;
                    cursor: pointer;
                    transition: color 0.3s ease;
                }
                .footer-backtotop:hover {
                    color: #ff7832;
                }

                .footer-giant-wrapper {
                    position: relative;
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: flex-end;
                    padding-top: 40px;
                    overflow: hidden;
                }
                .footer-giant-text {
                    font-family: 'Cal Sans', 'Inter', sans-serif;
                    font-size: clamp(80px, 20vw, 320px);
                    font-weight: 800;
                    line-height: 0.74;
                    letter-spacing: -0.05em;
                    margin: 0;
                    background: linear-gradient(180deg, #ffffff 20%, rgba(255, 255, 255, 0.05) 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    transform: translateY(16%);
                    user-select: none;
                    pointer-events: none;
                }

                @media (max-width: 1024px) {
                    .footer-container { padding: 60px 40px 0; gap: 80px; }
                    .footer-menu-row { gap: 32px; }
                }

                @media (max-width: 768px) {
                    .footer-menu-row { flex-direction: column; gap: 48px; }
                    .footer-content-row { flex-direction: column; gap: 24px; align-items: flex-start; }
                }
            `}</style>

            <div className="footer-container">
                <div className="footer-bg">
                    <img
                        src="https://framerusercontent.com/images/PdDBhDZBbpUwCIAstL4W9sLO5M.png"
                        alt=""
                    />
                </div>

                <div className="footer-top">
                    <div className="footer-menu-row">
                        {/* Navigasyon */}
                        <div className="footer-menu-col">
                            <p className="footer-cat-title">Navigasyon</p>
                            <div className="footer-link-list">
                                {[
                                    { label: 'Hakkımızda', view: 'about' as const },
                                    { label: 'Keşfet', view: 'vitrin' as const },
                                    { label: 'Araçlar', view: 'tools' as const },
                                    { label: 'Topluluk', view: 'community' as const },
                                ].map((item) => (
                                    <button 
                                        key={item.label} 
                                        onClick={() => onNavClick?.(item.view)}
                                        className="footer-link"
                                    >
                                        <h6 className="footer-link-text">{item.label}</h6>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sosyal Medya */}
                        <div className="footer-menu-col">
                            <p className="footer-cat-title">Sosyal Medya</p>
                            <div className="footer-link-list">
                                {[
                                    { label: 'Instagram', href: 'https://www.instagram.com/_selmanaydgn/' },
                                    { label: 'Twitter(X)', href: 'https://x.com' },
                                    { label: 'LinkedIn', href: 'https://linkedin.com' },
                                ].map((item) => (
                                    <a
                                        key={item.label}
                                        href={item.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="footer-link"
                                    >
                                        <h6 className="footer-link-text">{item.label}</h6>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Yasal */}
                        <div className="footer-menu-col">
                            <p className="footer-cat-title">Yasal</p>
                            <div className="footer-link-list">
                                {[
                                    { label: 'Gizlilik', href: '#' },
                                    { label: 'Koşullar', href: '#' },
                                ].map((item) => (
                                    <a key={item.label} href={item.href} className="footer-link">
                                        <h6 className="footer-link-text">{item.label}</h6>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="footer-content-row">
                        <p className="footer-copyright">
                            © 2026 Revizele. Tüm hakları saklıdır.
                        </p>
                        <button
                            className="footer-backtotop"
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        >
                            Başa Dön
                        </button>
                    </div>

                    <div
                        className="footer-giant-wrapper cursor-pointer"
                        onClick={onLogoClick || (() => window.scrollTo({ top: 0, behavior: 'smooth' }))}
                    >
                        <h1 className="footer-giant-text">REVİZELE</h1>
                    </div>
                </div>
            </div>
        </footer>
    );
}
