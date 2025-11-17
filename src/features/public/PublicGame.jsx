import React, { useState, useEffect } from 'react';
import useTimer from '../../hooks/useTimer';
import { getRoleImage } from '../../utils/roleConfig';
import { GAME_CONSTANTS } from '../../utils/gameConfig';
// Assurez-vous d'importer le fichier CSS correct
import './PublicScreen.css'; 
// Assurez-vous que getRoleImage peut retourner une clé pour le logo générique si nécessaire
// Ex: import GAME_LOGO from '../../assets/game_logo.png';

const PublicGame = ({ players, currentSession, currentQuestionData, startCorrectionFlow }) => {
    
    // Si la question ou la session n'est pas chargée, afficher un écran d'attente
    if (!currentQuestionData || !currentSession) return <div className="loading-state">En attente du début de la partie...</div>;

    // Utilisation du timer
    const { timeRemaining, isRunning } = useTimer(
        currentSession?.start_time, 
        GAME_CONSTANTS.QUESTION_TIME_LIMIT_S 
    ); 

    const [isImageHidden, setIsImageHidden] = useState(false);
    const [isCorrectionTriggered, setIsCorrectionTriggered] = useState(false);

    const readyPlayersCount = players.filter(p => p.is_ready).length;
    const allPlayersReady = players.length > 0 && readyPlayersCount === players.length; 

    // Données de la question/session
    const currentQuestion = currentQuestionData; 
    const currentQuestionIndex = currentSession?.current_question_index || 0;
    const totalQuestions = currentSession?.total_questions || 0;

    // --- LOGIQUE DE DÉCLENCHEMENT DE LA CORRECTION ---
    useEffect(() => {

        if (isCorrectionTriggered) return;
        
        // Condition 1: Le chrono est terminé (et est en cours d'exécution)
        if (timeRemaining <= 0 && isRunning) {
            console.log("Chrono terminé. Démarrage de la correction.");
            setIsCorrectionTriggered(true);
            startCorrectionFlow();
            return;
        }

        // Condition 2: Tous les joueurs ont validé
        if (allPlayersReady) {
            console.log("Tous les joueurs ont validé. Démarrage de la correction.");
            setIsCorrectionTriggered(true)
            startCorrectionFlow();
            return;
        }

        // Condition 3: Transition de l'image (Screen 4 -> Screen 5)
        const timeElapsed = GAME_CONSTANTS.QUESTION_TIME_LIMIT_S - timeRemaining;
        if (timeElapsed >= GAME_CONSTANTS.IMAGE_VISIBLE_DURATION_S && !isImageHidden && isRunning) {
            setIsImageHidden(true); // Masquer l'image après 15 secondes
        }
        
    }, [timeRemaining, allPlayersReady, startCorrectionFlow, isImageHidden, isRunning, isCorrectionTriggered]); 

    
    return (
        <div className="public-screen fullscreen">
            
            <header className="public-header-bar">
                {/* 1. Progression i/n */}
                <h3 className="question-index-display">
                    QUESTION <span className="highlight-text">{currentQuestionIndex + 1}</span> / {totalQuestions}
                </h3>
                
                {/* 2. Chronomètre (Centré) */}
                <div className={`timer-display ${timeRemaining <= 10 ? 'warning' : ''} ${timeRemaining <= 5 ? 'critical' : ''}`}>
                    <span className="icon">⏳</span> 
                    <span className="time-value">**{timeRemaining}**s</span>
                </div>

                {/* 3. Statut Général */}
                <div className="game-status-info">
                    {allPlayersReady && !isCorrectionTriggered 
                        ? <span className="status-ready">✅ TOUS VALIDÉS</span>
                        : <span className="status-waiting">JEU EN COURS...</span>
                    }
                </div>
            </header>

            {/* --- ZONE PRINCIPALE : IMAGES ET STATUT --- */}
            <div className="main-content-area">
                
                {/* 4. Zone de l'Image (Screen 4/5) */}
                <div className="question-image-area">
                    <div className={`clue-images-container ${isImageHidden ? 'hidden' : ''}`}>
                        {currentQuestion.images_url_display && Array.isArray(currentQuestion.images_url_display) && currentQuestion.images_url_display.map((url, index) => (
                            <img key={index} src={url} alt={`Indice ${index + 1}`} className="clue-image" />
                        ))}
                    </div>
                    
                    {/* Face cachée (Utiliser un visuel clair) */}
                    {isImageHidden && (
                        <div className="face-cachee reveal-animation">
                            <img src={getRoleImage('GAME_LOGO_KEY')} alt="Logo du jeu" className="game-logo-large-hidden" />
                            <p className="message-focus">
                                **Concentrez-vous sur le clavier.**<br/>
                                Les indices sont masqués.
                            </p>
                        </div>
                    )}
                </div>

            </div>

            {/* --- BANDEAU INFÉRIEUR : 8 Profils avec Scores (Screen 5) --- */}
            <div className="players-scores-display">
                {players.map((player) => (
                    <div key={player.id} className={`player-chip ${player.is_ready ? 'ready' : ''}`}>
                        <div className="player-avatar-container">
                            <img 
                                src={getRoleImage(player.role_name)} 
                                alt={`Logo ${player.role_name}`} 
                                className="player-logo" 
                            />
                            {player.is_ready && <span className="ready-overlay">✓</span>}
                        </div>
                        <span className="player-score-name">
                             <span className="score-value">{player.current_score}</span> pts
                        </span>
                    </div>
                ))}
            </div>
            
        </div>
    );
};

export default PublicGame;