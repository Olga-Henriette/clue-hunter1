import React, { useState, useEffect } from 'react';
import GAME_LOGO from '../../utils/roleConfig'; 
import './CorrectionScreen.css'; 
import { GAME_CONSTANTS } from '../../utils/gameConfig';


const CorrectionScreen = ({ question, session, onCorrectionEnd }) => {
    // Si la question n'est pas passée, on ne peut rien faire
    if (!question) return <div>Chargement de la correction...</div>;

    const answerKey = question.answer_key.toUpperCase();
    const letterPool = question.letter_pool.toUpperCase().split('');
    const answerLength = answerKey.length;

    const imagesToDisplay = question.images_url_display || question.images_url;
    const lettersToDisplay = question.letter_pool_display || question.letter_pool.toUpperCase().split('');


    // État pour suivre la partie de la réponse qui est complétée
    const [displayedAnswer, setDisplayedAnswer] = useState(Array(answerLength).fill(''));
    const [animationComplete, setAnimationComplete] = useState(false);

    // --- LOGIQUE D'ANIMATION DE L'AUTO-COMPLÉTION ---
    useEffect(() => {
        if (animationComplete) return;

        let index = 0;
        const answerKey = question.answer_key.toUpperCase();
        
        // Intervalle pour compléter une lettre toutes les 150 ms (ajustez si besoin)
        const interval = setInterval(() => {
            if (index < answerLength) {
                setDisplayedAnswer(prev => {
                    const newAnswer = [...prev];
                    newAnswer[index] = answerKey[index];
                    return newAnswer;
                });
                index++;
            } else {
                clearInterval(interval);
                setAnimationComplete(true);
                
            }
        }, 150);

        const correctionTimer = setTimeout(() => {
            if (onCorrectionEnd) {
                onCorrectionEnd();
            }
        }, GAME_CONSTANTS.CORRECTION_VIEW_DURATION_S * 1000); // Durée totale: 10s

        return () => {
             clearInterval(interval);
        }

    }, [answerKey, answerLength, animationComplete, question.answer_key]);

    // --- LOGIQUE DE TRANSITION APRÈS DURÉE FIXE (10 secondes) ---
    useEffect(() => {
        if (!onCorrectionEnd) return; // S'assurer que la fonction existe

        const correctionTimer = setTimeout(() => {
            onCorrectionEnd(); // Déclenche la transition vers ScoreboardScreen
        }, GAME_CONSTANTS.CORRECTION_VIEW_DURATION_S * 1000); // Durée totale: 10s

        return () => {
             clearTimeout(correctionTimer); // Nettoyage lors du démontage ou re-rendu
        };
    }, [onCorrectionEnd]); // Dépendance sur la fonction de fin de correction
    
    // --- RENDU ---
    return (
        <div className="correction-screen fullscreen">
            
            {/* 1. Entête */}
            <div className="header-correction">
                <div className="header-left">
                    <img src={GAME_LOGO} alt="Logo du jeu" className="game-logo-large" />
                    <h1>Correction</h1>
                </div>
                {/* 2. i/n en haut à droite */}
                <h3 className="question-count">Q {session.current_question_index + 1} / {session.total_questions}</h3>
            </div>

            {/* 3. Images de la question (bien visible) */}
            <div className="clue-images-correction">
                {Array.isArray(imagesToDisplay) && imagesToDisplay.map((url, index) => (
                    <img key={index} src={url} alt={`Indice ${index + 1}`} className="correction-image" />
                ))}
            </div>

            {/* 4. Affichage du letter_pool (en dessous de la case réponse, comme demandé) */}
            <div className="letter-pool-display-correction">
                 <div className="letter-line-correction">
                    {lettersToDisplay.map((letter, index) => (
                        <span key={index} className="letter-display-chip-correction">
                            {letter}
                        </span>
                    ))}
                </div>
            </div>

            {/* 5. Zone de Réponse (Animation de l'auto-complétion) */}
            <div className="answer-box correction-mode">
                {displayedAnswer.map((char, index) => (
                    <span key={index} className={`answer-slot-correction ${char ? 'revealed' : ''}`}>
                        {char || '_'} 
                    </span>
                ))}
            </div>

            {animationComplete && (
                <p className="final-message-correction">
                    Réponse Correcte : **{answerKey}**
                </p>
            )}
        </div>
    );
};

export default CorrectionScreen;