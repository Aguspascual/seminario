import React from 'react';
import { Link } from 'react-router-dom';
import styles from './KPICard.module.css';

const KPICard = ({ title, icon: Icon, value, subtext, status, linkTo, onClick, colorClass }) => {
    // status: 'normal', 'warning', 'danger', 'success'

    return (
        <div className={`${styles.card} ${styles[status]} ${styles[colorClass]}`}>
            <div className={styles.cardHeader}>
                <div className={styles.iconContainer}>
                    {/* Render Lucide Icon if it's a component, else fallback (though we switched to Lucide) */}
                    {Icon && <Icon size={22} strokeWidth={1.5} />}
                </div>
                <h3 className={styles.cardTitle}>{title}</h3>
            </div>

            <div className={styles.cardBody}>
                <div className={styles.valueContainer}>
                    {value}
                </div>
                {subtext && <p className={styles.subtext}>{subtext}</p>}
            </div>

            {(linkTo || onClick) && (
                <div className={styles.cardFooter}>
                    {onClick ? (
                        <button
                            onClick={onClick}
                            className={styles.linkBtn}
                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit' }}
                        >
                            Ver detalles <span className={styles.arrow}>→</span>
                        </button>
                    ) : (
                        <Link to={linkTo} className={styles.linkBtn}>
                            Ver detalles <span className={styles.arrow}>→</span>
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
};

export default KPICard;
