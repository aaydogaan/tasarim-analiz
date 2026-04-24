import React from 'react';

export default function Footer({ onLogoClick }: { onLogoClick?: () => void }) {

    return (
        <footer className="footer-root">
            <style>{`
                /* ═══════════════════════════════════════════════ */
                /* Footer – pixel-perfect replica of newhome      */
                /* ═══════════════════════════════════════════════ */

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
                    border-bottom-left-radius: 0;
                    border-bottom-right-radius: 0;
                    box-sizing: border-box;
                    background: #0a0a0d;
                }

                /* ── Container ── */
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
                    gap: 168px;
                    padding: 112px 148px 0;
                    box-sizing: border-box;
                }

                /* ── Background Image ── */
                .footer-bg {
                    position: absolute;
                    inset: 0;
                    border-radius: inherit;
                    z-index: 0;
                }
                .footer-bg img {
                    display: block;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    object-position: center;
                    border-radius: inherit;
                }

                /* ── Top (Menu Area) ── */
                .footer-top {
                    z-index: 2;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    width: 100%;
                    position: relative;
                    overflow: hidden;
                }

                /* ── Menu Row ── */
                .footer-menu-row {
                    display: flex;
                    flex-direction: row;
                    align-items: flex-start;
                    gap: 24px;
                    width: 100%;
                    position: relative;
                    overflow: hidden;
                }

                /* ── Menu Column ── */
                .footer-menu-col {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 16px;
                    flex: 1 0 0;
                    max-width: 264px;
                    position: relative;
                    overflow: hidden;
                }

                /* ── Category Title (Navigation, Social, Legals) ── */
                .footer-cat-title {
                    font-family: 'Inter', sans-serif;
                    font-size: 14px;
                    font-weight: 500;
                    line-height: 20px;
                    letter-spacing: -0.14px;
                    color: rgba(255, 255, 255, 0.64);
                    margin: 0;
                    white-space: pre;
                }

                /* ── Link List ── */
                .footer-link-list {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 8px;
                    width: 100%;
                    position: relative;
                    overflow: hidden;
                }

                /* ── Single Link ── */
                .footer-link {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    justify-content: center;
                    width: min-content;
                    cursor: pointer;
                    text-decoration: none;
                    position: relative;
                    overflow: hidden;
                }

                .footer-link-text {
                    font-family: 'Cal Sans', 'Inter', sans-serif;
                    font-size: 24px;
                    font-weight: 600;
                    line-height: 32px;
                    letter-spacing: 0px;
                    color: rgb(255, 255, 255);
                    margin: 0;
                    white-space: pre;
                    text-align: left;
                }

                .footer-link-underline {
                    width: 100%;
                    height: 2px;
                    background-color: rgb(220, 220, 220);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .footer-link:hover .footer-link-underline {
                    opacity: 1;
                }

                /* ── Bottom Section ── */
                .footer-bottom {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-start;
                    gap: 16px;
                    width: 100%;
                    position: relative;
                    overflow: visible;
                    z-index: 2;
                }

                /* ── Content Row (copyright / time / back-to-top) ── */
                .footer-content-row {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    justify-content: space-between;
                    width: 100%;
                    position: relative;
                    overflow: hidden;
                }

                .footer-copyright {
                    flex: 1 0 0;
                    font-family: 'Inter', sans-serif;
                    font-size: 14px;
                    font-weight: 500;
                    line-height: 20px;
                    letter-spacing: -0.14px;
                    color: rgba(255, 255, 255, 0.64);
                    margin: 0;
                    word-break: break-word;
                }

                .footer-dev-wrapper {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    justify-content: center;
                    flex: 1 0 0;
                    gap: 8px;
                    position: relative;
                    overflow: visible;
                }

                .footer-dev-label {
                    font-family: 'Inter', sans-serif;
                    font-size: 14px;
                    font-weight: 500;
                    line-height: 20px;
                    letter-spacing: -0.14px;
                    color: rgba(255, 255, 255, 0.64);
                    margin: 0;
                    white-space: pre;
                }

                .footer-dev-link {
                    font-family: 'Inter', sans-serif;
                    font-size: 14px;
                    font-weight: 600;
                    line-height: 20px;
                    letter-spacing: -0.14px;
                    color: #fff;
                    text-decoration: none;
                    transition: color 0.3s ease;
                }

                .footer-dev-link:hover {
                    color: #ff4d00;
                }

                .footer-backtotop {
                    flex: 1 0 0;
                    font-family: 'Inter', sans-serif;
                    font-size: 14px;
                    font-weight: 500;
                    line-height: 20px;
                    letter-spacing: -0.14px;
                    color: rgb(255, 77, 0);
                    text-align: right;
                    text-decoration: none;
                    margin: 0;
                    cursor: pointer;
                    background: none;
                    border: none;
                    padding: 0;
                    word-break: break-word;
                    transition: color 0.3s ease;
                }
                .footer-backtotop:hover {
                    color: rgb(255, 120, 50);
                }


                /* ── Giant Brand Text (Replacing Image) ── */
                .footer-giant-wrapper {
                    position: relative;
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: flex-end;
                    overflow: hidden;
                    z-index: 2;
                    margin-top: auto;
                    padding-top: 40px;
                }
                .footer-giant-text {
                    font-family: 'Cal Sans', 'Inter', sans-serif;
                    font-size: clamp(80px, 21vw, 380px); /* scales fluidly */
                    font-weight: 800;
                    line-height: 0.74;
                    letter-spacing: -0.05em;
                    margin: 0;
                    padding: 0;
                    /* The signature Agero fade-out effect */
                    background: linear-gradient(180deg, #ffffff 20%, rgba(255, 255, 255, 0.05) 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    transform: translateY(16%);
                    user-select: none;
                    pointer-events: none;
                    text-align: center;
                }

                /* ── Lights SVG ── */
                .footer-lights {
                    position: absolute;
                    z-index: 1;
                    top: -991px;
                    left: 268px;
                    right: -641px;
                    height: 1401px;
                    flex-shrink: 0;
                    pointer-events: none;
                }
                .footer-lights svg {
                    width: 100%;
                    height: 100%;
                }

                /* ── Progressive Blur ── */
                .footer-blur {
                    position: absolute;
                    z-index: 3;
                    bottom: 0;
                    left: calc(50% - 712px);
                    width: 1424px;
                    height: 100px;
                    overflow: hidden;
                    backdrop-filter: blur(4px);
                    -webkit-backdrop-filter: blur(4px);
                    background-color: rgba(220, 220, 220, 0.01);
                    border-bottom-left-radius: 32px;
                    border-bottom-right-radius: 32px;
                    pointer-events: none;
                }

                /* ═══════════════════════════════════════════════ */
                /* Tablet (810px and below)                        */
                /* ═══════════════════════════════════════════════ */
                @media (max-width: 1439px) {
                    .footer-container {
                        gap: 128px;
                        padding: 40px 30px 0;
                    }
                    .footer-pattern {
                        /* 253px at tablet */
                    }
                    .footer-lights {
                        top: -1019px;
                        left: 152px;
                        right: -525px;
                    }
                    .footer-blur {
                        width: 794px;
                        height: 72px;
                        left: calc(50% - 397px);
                    }
                }

                /* ═══════════════════════════════════════════════ */
                /* Mobile (809px and below)                        */
                /* ═══════════════════════════════════════════════ */
                @media (max-width: 809px) {
                    .footer-container {
                        gap: 68px;
                        padding: 20px 20px 0;
                    }

                    .footer-menu-row {
                        flex-direction: column;
                    }

                    .footer-menu-col {
                        flex: none;
                        width: 100%;
                        max-width: none;
                    }

                    .footer-bottom {
                        gap: 30px;
                    }

                    .footer-content-row {
                        flex-direction: column;
                        justify-content: flex-start;
                        gap: 24px;
                    }

                    .footer-copyright,
                    .footer-dev-wrapper,
                    .footer-backtotop {
                        flex: none;
                        width: 100%;
                        text-align: left;
                    }

                    .footer-pattern {
                        /* smaller at mobile */
                    }

                    .footer-lights {
                        top: -999px;
                        left: 73px;
                        right: -446px;
                    }

                    .footer-blur {
                        width: 374px;
                        height: 35px;
                        left: calc(50% - 187px);
                    }
                }
            `}</style>

            {/* ── Container ── */}
            <div className="footer-container">
                {/* Background Image */}
                <div className="footer-bg">
                    <img
                        src="https://framerusercontent.com/images/PdDBhDZBbpUwCIAstL4W9sLO5M.png"
                        alt=""
                        loading="lazy"
                    />
                </div>

                {/* ── Top Section: Menu ── */}
                <div className="footer-top">
                    <div className="footer-menu-row">
                        {/* Navigasyon */}
                        <div className="footer-menu-col">
                            <p className="footer-cat-title">Navigasyon</p>
                            <div className="footer-link-list">
                                {[
                                    { label: 'Hakkımızda', href: '#' },
                                    { label: 'Çalışmalar', href: '#' },
                                    { label: 'Hizmetler', href: '#' },
                                    { label: 'Blog', href: '#' },
                                ].map((item) => (
                                    <a key={item.label} href={item.href} className="footer-link">
                                        <h6 className="footer-link-text">{item.label}</h6>
                                        <div className="footer-link-underline" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Sosyal Medya */}
                        <div className="footer-menu-col">
                            <p className="footer-cat-title">Sosyal Medya</p>
                            <div className="footer-link-list">
                                {[
                                    { label: 'Instagram', href: 'https://www.instagram.com/_selmanaydgn/', external: true },
                                    { label: 'Twitter(X)', href: 'https://x.com', external: true },
                                    { label: 'LinkedIn', href: 'https://linkedin.com', external: true },
                                ].map((item) => (
                                    <a
                                        key={item.label}
                                        href={item.href}
                                        className="footer-link"
                                        target={item.external ? '_blank' : undefined}
                                        rel={item.external ? 'noopener noreferrer' : undefined}
                                    >
                                        <h6 className="footer-link-text">{item.label}</h6>
                                        <div className="footer-link-underline" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Yasal */}
                        <div className="footer-menu-col">
                            <p className="footer-cat-title">Yasal</p>
                            <div className="footer-link-list">
                                {[
                                    { label: 'Gizlilik Politikası', href: '#' },
                                    { label: 'Kullanım Koşulları', href: '#' },
                                ].map((item) => (
                                    <a key={item.label} href={item.href} className="footer-link">
                                        <h6 className="footer-link-text">{item.label}</h6>
                                        <div className="footer-link-underline" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Bottom Section ── */}
                <div className="footer-bottom">
                    {/* Content Row */}
                    <div className="footer-content-row">
                        <p className="footer-copyright">
                            © 2026 Revizele. Tüm hakları saklıdır.
                        </p>

                        <div className="footer-dev-wrapper">
                            <p className="footer-dev-label">Geliştirici:</p>
                            <a
                                href="https://www.instagram.com/_selmanaydgn/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="footer-dev-link"
                            >
                                Selman Aydoğan
                            </a>
                        </div>

                        <button
                            className="footer-backtotop"
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        >
                            Başa Dön
                        </button>
                    </div>

                    {/* Giant Text representing the brand, perfectly faded and clipped like original */}
                    <div
                        className="footer-giant-wrapper cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
                        onClick={onLogoClick || (() => window.scrollTo({ top: 0, behavior: 'smooth' }))}
                    >
                        <h1 className="footer-giant-text">REVİZELE</h1>
                    </div>
                </div>
            </div>

            {/* ── Lights SVG ── */}
            <div className="footer-lights" aria-hidden="true">
                <svg viewBox="0 0 1814 1402">
                    <g opacity="0.4">
                        <defs>
                            <filter id="footerBlur">
                                <feGaussianBlur stdDeviation="40" />
                            </filter>
                        </defs>
                        <g filter="url(#footerBlur)">
                            <path
                                d="M1773.55 156L1813.86 196.305L1106.75 903.412L613.447 1373L1066.45 863.107L1773.55 156Z"
                                fill="#FF4D00"
                            />
                            <path
                                d="M1653.55 156L1693.86 196.305L986.748 903.412L493.443 1373L946.443 863.107L1653.55 156Z"
                                fill="#FF4D00"
                            />
                        </g>
                    </g>
                </svg>
            </div>

            {/* ── Progressive Blur ── */}
            <div className="footer-blur" />
        </footer>
    );
}
