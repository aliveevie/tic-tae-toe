(define-constant THIS_CONTRACT (as-contract tx-sender)) ;; The address of this contract itself
(define-constant ERR_MIN_BET_AMOUNT u100) ;; Error thrown when a player tries to create a game with a bet amount less than the minimum (0.0001 STX)
(define-constant ERR_INVALID_MOVE u101) ;; Error thrown when a move is invalid, i.e. not within range of the board or not an X or an O
(define-constant ERR_GAME_NOT_FOUND u102) ;; Error thrown when a game cannot be found given a Game ID, i.e. invalid Game ID
(define-constant ERR_GAME_CANNOT_BE_JOINED u103) ;; Error thrown when a game cannot be joined, usually because it already has two players
(define-constant ERR_NOT_YOUR_TURN u104) ;; Error thrown when a player tries to make a move when it is not their turn
(define-constant ERR_GAME_OVER u105) ;; Error thrown when trying to play on a finished game

;; The Game ID to use for the next game
(define-data-var latest-game-id uint u0)

(define-map games 
    uint ;; Key (Game ID)
    { ;; Value (Game Tuple)
        player-one: principal,
        player-two: (optional principal),
        is-player-one-turn: bool,
        bet-amount: uint,
        board: (list 9 uint),
        winner: (optional principal),
        is-single-player: bool,
        player-one-symbol: uint,
        is-draw: bool
    }
)

;; Player statistics
(define-map player-stats
    principal ;; Player address
    {
        games-played: uint,
        games-won: uint,
        games-lost: uint,
        games-drawn: uint,
        total-bet: uint,
        total-winnings: uint
    }
)

;; Create a single-player game against computer
(define-public (create-single-player-game (bet-amount uint) (player-symbol uint) (move-index uint))
    (let (
        (game-id (var-get latest-game-id))
        (starting-board (list u0 u0 u0 u0 u0 u0 u0 u0 u0))
        (game-board-with-move (unwrap! (replace-at? starting-board move-index player-symbol) (err ERR_INVALID_MOVE)))
        ;; Computer makes its move
        (computer-symbol (if (is-eq player-symbol u1) u2 u1))
        (computer-move-index (get-computer-move game-board-with-move computer-symbol))
        (game-board (unwrap! (replace-at? game-board-with-move computer-move-index computer-symbol) (err ERR_INVALID_MOVE)))
        (player-won (has-won game-board-with-move))
        (computer-won (has-won game-board))
        (is-player-one-turn (is-eq player-symbol u1))
        (game-data {
            player-one: contract-caller,
            player-two: (some THIS_CONTRACT),
            is-player-one-turn: is-player-one-turn,
            bet-amount: bet-amount,
            board: game-board,
            winner: (if player-won (some contract-caller) (if computer-won (some THIS_CONTRACT) none)),
            is-single-player: true,
            player-one-symbol: player-symbol,
            is-draw: false
        })
    )

    ;; Validations
    (asserts! (> bet-amount u0) (err ERR_MIN_BET_AMOUNT))
    (asserts! (or (is-eq player-symbol u1) (is-eq player-symbol u2)) (err ERR_INVALID_MOVE))
    (asserts! (validate-move starting-board move-index player-symbol) (err ERR_INVALID_MOVE))

    ;; Transfer bet amount
    (try! (stx-transfer? bet-amount contract-caller THIS_CONTRACT))
    
    ;; Update player stats
    (update-player-stats-on-game-start contract-caller bet-amount)
    
    ;; Check if game ended immediately
    (if (or player-won computer-won)
        (if player-won
            (begin
                (try! (as-contract (stx-transfer? bet-amount tx-sender contract-caller)))
                (update-player-stats-on-win contract-caller bet-amount)
            )
            (update-player-stats-on-loss contract-caller)
        )
        false
    )
    
    ;; Save game
    (map-set games game-id game-data)
    (var-set latest-game-id (+ game-id u1))

    (print { action: "create-single-player-game", data: game-data})
    (ok game-id)
))

;; Create a multiplayer game (original functionality)
(define-public (create-game (bet-amount uint) (move-index uint) (move uint))
    (let (
        (game-id (var-get latest-game-id))
        (starting-board (list u0 u0 u0 u0 u0 u0 u0 u0 u0))
        (game-board (unwrap! (replace-at? starting-board move-index move) (err ERR_INVALID_MOVE)))
        (game-data {
            player-one: contract-caller,
            player-two: none,
            is-player-one-turn: false,
            bet-amount: bet-amount,
            board: game-board,
            winner: none,
            is-single-player: false,
            player-one-symbol: u1,
            is-draw: false
        })
    )

    ;; Ensure that user has put up a bet amount greater than the minimum
    (asserts! (> bet-amount u0) (err ERR_MIN_BET_AMOUNT))
    ;; Ensure that the move being played is an `X`, not an `O`
    (asserts! (is-eq move u1) (err ERR_INVALID_MOVE))
    ;; Ensure that the move meets validity requirements
    (asserts! (validate-move starting-board move-index move) (err ERR_INVALID_MOVE))

    ;; Transfer the bet amount STX from user to this contract
    (try! (stx-transfer? bet-amount contract-caller THIS_CONTRACT))
    
    ;; Update player stats
    (update-player-stats-on-game-start contract-caller bet-amount)
    
    ;; Update the games map with the new game data
    (map-set games game-id game-data)
    ;; Increment the Game ID counter
    (var-set latest-game-id (+ game-id u1))

    ;; Log the creation of the new game
    (print { action: "create-game", data: game-data})
    ;; Return the Game ID of the new game
    (ok game-id)
))

(define-public (join-game (game-id uint) (move-index uint) (move uint))
    (let (
        (original-game-data (unwrap! (map-get? games game-id) (err ERR_GAME_NOT_FOUND)))
        (original-board (get board original-game-data))
        (game-board (unwrap! (replace-at? original-board move-index move) (err ERR_INVALID_MOVE)))
        (game-data (merge original-game-data {
            board: game-board,
            player-two: (some contract-caller),
            is-player-one-turn: true
        }))
    )

    (asserts! (is-none (get player-two original-game-data)) (err ERR_GAME_CANNOT_BE_JOINED)) 
    (asserts! (is-eq move u2) (err ERR_INVALID_MOVE))
    (asserts! (validate-move original-board move-index move) (err ERR_INVALID_MOVE))

    (try! (stx-transfer? (get bet-amount original-game-data) contract-caller THIS_CONTRACT))
    (update-player-stats-on-game-start contract-caller (get bet-amount original-game-data))
    (map-set games game-id game-data)

    (print { action: "join-game", data: game-data})
    (ok game-id)
))

;; Play move in single-player game
(define-public (play-single-player (game-id uint) (move-index uint))
    (let (
        (original-game-data (unwrap! (map-get? games game-id) (err ERR_GAME_NOT_FOUND)))
        (original-board (get board original-game-data))
        (player-symbol (get player-one-symbol original-game-data))
        (computer-symbol (if (is-eq player-symbol u1) u2 u1))
        (game-board-with-move (unwrap! (replace-at? original-board move-index player-symbol) (err ERR_INVALID_MOVE)))
        (player-won (has-won game-board-with-move))
        (is-board-full-after-player (is-board-full game-board-with-move))
    )
    
    ;; Validations
    (asserts! (get is-single-player original-game-data) (err ERR_INVALID_MOVE))
    (asserts! (is-none (get winner original-game-data)) (err ERR_GAME_OVER))
    (asserts! (not (get is-draw original-game-data)) (err ERR_GAME_OVER))
    (asserts! (is-eq (get player-one original-game-data) contract-caller) (err ERR_NOT_YOUR_TURN))
    (asserts! (validate-move original-board move-index player-symbol) (err ERR_INVALID_MOVE))
    
    ;; Check if player won
    (if player-won
        (let (
            (final-game-data (merge original-game-data {
                board: game-board-with-move,
                winner: (some contract-caller)
            }))
        )
            (try! (as-contract (stx-transfer? (get bet-amount original-game-data) tx-sender contract-caller)))
            (update-player-stats-on-win contract-caller (get bet-amount original-game-data))
            (map-set games game-id final-game-data)
            (print {action: "play-single-player", data: final-game-data})
            (ok game-id)
        )
        ;; Check for draw
        (if is-board-full-after-player
            (let (
                (final-game-data (merge original-game-data {
                    board: game-board-with-move,
                    is-draw: true
                }))
            )
                (try! (as-contract (stx-transfer? (get bet-amount original-game-data) tx-sender contract-caller)))
                (update-player-stats-on-draw contract-caller)
                (map-set games game-id final-game-data)
                (print {action: "play-single-player", data: final-game-data})
                (ok game-id)
            )
            ;; Computer plays
            (let (
                (computer-move-index (get-computer-move game-board-with-move computer-symbol))
                (game-board (unwrap! (replace-at? game-board-with-move computer-move-index computer-symbol) (err ERR_INVALID_MOVE)))
                (computer-won (has-won game-board))
                (is-board-full (is-board-full game-board))
                (final-game-data (merge original-game-data {
                    board: game-board,
                    winner: (if computer-won (some THIS_CONTRACT) none),
                    is-draw: (if (and (not computer-won) is-board-full) true false)
                }))
            )
                (if computer-won
                    (update-player-stats-on-loss contract-caller)
                    (if is-board-full
                        (begin
                            (try! (as-contract (stx-transfer? (get bet-amount original-game-data) tx-sender contract-caller)))
                            (update-player-stats-on-draw contract-caller)
                        )
                        false
                    )
                )
                (map-set games game-id final-game-data)
                (print {action: "play-single-player", data: final-game-data})
                (ok game-id)
            )
        )
    )
))

;; Play move in multiplayer game
(define-public (play (game-id uint) (move-index uint) (move uint))
    (let (
        (original-game-data (unwrap! (map-get? games game-id) (err ERR_GAME_NOT_FOUND)))
        (original-board (get board original-game-data))
        (is-player-one-turn (get is-player-one-turn original-game-data))
        (player-turn (if is-player-one-turn (get player-one original-game-data) (unwrap! (get player-two original-game-data) (err ERR_GAME_NOT_FOUND))))
        (expected-move (if is-player-one-turn u1 u2))
        (game-board (unwrap! (replace-at? original-board move-index move) (err ERR_INVALID_MOVE)))
        (is-now-winner (has-won game-board))
        (is-board-full (is-board-full game-board))
        (game-data (merge original-game-data {
            board: game-board,
            is-player-one-turn: (not is-player-one-turn),
            winner: (if is-now-winner (some player-turn) none),
            is-draw: (if (and (not is-now-winner) is-board-full) true false)
        }))
    )

    (asserts! (is-eq player-turn contract-caller) (err ERR_NOT_YOUR_TURN))
    (asserts! (is-eq move expected-move) (err ERR_INVALID_MOVE))
    (asserts! (validate-move original-board move-index move) (err ERR_INVALID_MOVE))
    (asserts! (is-none (get winner original-game-data)) (err ERR_GAME_OVER))

    ;; Handle game end
    (if is-now-winner 
        (begin
            (try! (as-contract (stx-transfer? (* u2 (get bet-amount game-data)) tx-sender player-turn)))
            (update-player-stats-on-win player-turn (get bet-amount game-data))
            (update-player-stats-on-loss (if is-player-one-turn 
                (unwrap! (get player-two game-data) (err ERR_GAME_NOT_FOUND))
                (get player-one game-data)
            ))
        )
        (if is-board-full
            (begin
                (try! (as-contract (stx-transfer? (get bet-amount game-data) tx-sender (get player-one game-data))))
                (try! (as-contract (stx-transfer? (get bet-amount game-data) tx-sender (unwrap! (get player-two game-data) (err ERR_GAME_NOT_FOUND)))))
                (update-player-stats-on-draw (get player-one game-data))
                (update-player-stats-on-draw (unwrap! (get player-two game-data) (err ERR_GAME_NOT_FOUND)))
            )
            false
        )
    )

    (map-set games game-id game-data)
    (print {action: "play", data: game-data})
    (ok game-id)
))

(define-read-only (get-game (game-id uint))
    (map-get? games game-id)
)

(define-read-only (get-latest-game-id)
    (var-get latest-game-id)
)

(define-read-only (get-player-stats (player principal))
    (default-to {
        games-played: u0,
        games-won: u0,
        games-lost: u0,
        games-drawn: u0,
        total-bet: u0,
        total-winnings: u0
    } (map-get? player-stats player))
)

(define-private (validate-move (board (list 9 uint)) (move-index uint) (move uint))
    (let (
        (index-in-range (and (>= move-index u0) (< move-index u9)))
        (x-or-o (or (is-eq move u1) (is-eq move u2)))
        (empty-spot (is-eq (unwrap! (element-at? board move-index) false) u0))
    )
    (and (is-eq index-in-range true) (is-eq x-or-o true) empty-spot)
))

;; Check if board is full
(define-private (is-board-full (board (list 9 uint)))
    (is-eq (len (filter is-empty-cell board)) u0)
)

(define-private (is-empty-cell (cell uint))
    (is-eq cell u0)
)

;; Given a board, return true if any possible three-in-a-row line has been completed
(define-private (has-won (board (list 9 uint))) 
    (or
        (is-line board u0 u1 u2) ;; Row 1
        (is-line board u3 u4 u5) ;; Row 2
        (is-line board u6 u7 u8) ;; Row 3
        (is-line board u0 u3 u6) ;; Column 1
        (is-line board u1 u4 u7) ;; Column 2
        (is-line board u2 u5 u8) ;; Column 3
        (is-line board u0 u4 u8) ;; Left to Right Diagonal
        (is-line board u2 u4 u6) ;; Right to Left Diagonal
    )
)

(define-private (is-line (board (list 9 uint)) (a uint) (b uint) (c uint)) 
    (let (
        (a-val (unwrap! (element-at? board a) false))
        (b-val (unwrap! (element-at? board b) false))
        (c-val (unwrap! (element-at? board c) false))
    )
    (and (is-eq a-val b-val) (is-eq a-val c-val) (not (is-eq a-val u0)))
))

;; Simple AI: Try to win, block opponent, or take center/corner
(define-private (get-computer-move (board (list 9 uint)) (computer-symbol uint))
    (let (
        (opponent-symbol (if (is-eq computer-symbol u1) u2 u1))
        (winning-move (find-winning-move board computer-symbol))
    )
    (if (< winning-move u9)
        winning-move
        (let ((blocking-move (find-winning-move board opponent-symbol)))
            (if (< blocking-move u9)
                blocking-move
                (get-strategic-move board)
            )
        )
    ))
)

;; Find a winning move for given symbol
(define-private (find-winning-move (board (list 9 uint)) (symbol uint))
    (if (can-win-at board symbol u0) u0
    (if (can-win-at board symbol u1) u1
    (if (can-win-at board symbol u2) u2
    (if (can-win-at board symbol u3) u3
    (if (can-win-at board symbol u4) u4
    (if (can-win-at board symbol u5) u5
    (if (can-win-at board symbol u6) u6
    (if (can-win-at board symbol u7) u7
    (if (can-win-at board symbol u8) u8
    u9)))))))))
)

(define-private (can-win-at (board (list 9 uint)) (symbol uint) (index uint))
    (let ((cell-value (unwrap! (element-at? board index) u0)))
        (if (is-eq cell-value u0)
            (has-won (unwrap! (replace-at? board index symbol) (list u0 u0 u0 u0 u0 u0 u0 u0 u0)))
            false
        )
    )
)

;; Get strategic move (prefer center, then corners, then edges)
(define-private (get-strategic-move (board (list 9 uint)))
    (if (is-eq (unwrap! (element-at? board u4) u1) u0) u4  ;; Center
    (if (is-eq (unwrap! (element-at? board u0) u1) u0) u0  ;; Top-left
    (if (is-eq (unwrap! (element-at? board u2) u1) u0) u2  ;; Top-right
    (if (is-eq (unwrap! (element-at? board u6) u1) u0) u6  ;; Bottom-left
    (if (is-eq (unwrap! (element-at? board u8) u1) u0) u8  ;; Bottom-right
    (if (is-eq (unwrap! (element-at? board u1) u1) u0) u1  ;; Top
    (if (is-eq (unwrap! (element-at? board u3) u1) u0) u3  ;; Left
    (if (is-eq (unwrap! (element-at? board u5) u1) u0) u5  ;; Right
    u7))))))))  ;; Bottom
)

;; Player stats update functions
(define-private (update-player-stats-on-game-start (player principal) (bet-amount uint))
    (let ((stats (get-player-stats player)))
        (map-set player-stats player (merge stats {
            games-played: (+ (get games-played stats) u1),
            total-bet: (+ (get total-bet stats) bet-amount)
        }))
    )
)

(define-private (update-player-stats-on-win (player principal) (winnings uint))
    (let ((stats (get-player-stats player)))
        (map-set player-stats player (merge stats {
            games-won: (+ (get games-won stats) u1),
            total-winnings: (+ (get total-winnings stats) winnings)
        }))
    )
)

(define-private (update-player-stats-on-loss (player principal))
    (let ((stats (get-player-stats player)))
        (map-set player-stats player (merge stats {
            games-lost: (+ (get games-lost stats) u1)
        }))
    )
)

(define-private (update-player-stats-on-draw (player principal))
    (let ((stats (get-player-stats player)))
        (map-set player-stats player (merge stats {
            games-drawn: (+ (get games-drawn stats) u1)
        }))
    )
)