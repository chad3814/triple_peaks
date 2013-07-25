'use strict';

/*global Deck, Card, $*/

var Position = (function (win) {
    var Position = function (rank, suit) {
        Card.call(this, rank, suit);
        this.covered_by = [];
        this.covering = [];
        this.div = null;
        this.x = 0;
        this.y = 0;
    };

    Position.prototype.cover = function (position) {
        position.covered_by.push(this);
        this.covering.push(position);
    };

    Position.prototype.remove = function () {
        var coverer = this;
        this.covering.forEach(function (covered) {
            covered.covered_by = covered.covered_by.filter(function (position) {
                return position !== coverer;
            });
        });
        this.covering = [];
    };

    Position.prototype.isCovered = function () {
        return this.covered_by.length !== 0;
    };

    Position.prototype.setDrawLocation = function (x, y) {
        this.x = x;
        this.y = y;
    };

    Position.prototype.draw = function () {
        if (this.isCovered()) {
            this.div = Card.drawBack.call(this, this.x, this.y, this.div);
        } else {
            this.div = Card.prototype.draw.call(this, this.x, this.y, this.div);
        }
    };

    Position.FIRST_SUIT = Card.FIRST_SUIT;
    Position.LAST_SUIT = Card.LAST_SUIT;
    Position.FIRST_RANK = Card.FIRST_RANK;
    Position.LAST_RANK = Card.LAST_RANK;
    return Position;
}(this));

var Game = (function (win) {
    var Game = function () {
        this.deck = new Deck(Position);
        this.deck.shuffle();
        this.positions = [];
        this.deck_div = null;
        var i;
        var j;
        var covered_index;
        var x, y;
        for (i = 0; i < 16; i++) {
            this.positions.push(this.deck.drawOne());
        }
        // first row
        this.positions[0].setDrawLocation(120, 0);
        this.positions[1].setDrawLocation(280, 0);
        this.positions[2].setDrawLocation(440, 0);

        // second row, first of third row
        for (i = 3, j = 0; j < 7; i++, j++) {
            covered_index = Math.floor(j / 2);
            // set draw location based on what it covers
            x = this.positions[covered_index].x - 40;
            x += 80 * this.positions[covered_index].covered_by.length;
            y = this.positions[covered_index].y + 64;
            this.positions[i].setDrawLocation(x, y);

            this.positions[i].cover(this.positions[covered_index]);
        }

        // rest of the third row
        for (j = 0; j < 6; i++, j++) {
            covered_index = 3 + j;
            // set draw location based on what it covers
            x = this.positions[covered_index].x - 40;
            x += 80 * this.positions[covered_index].covered_by.length;
            y = this.positions[covered_index].y + 64;
            this.positions[i].setDrawLocation(x, y);

            this.positions[i].cover(this.positions[covered_index]);
            if (i !== 15) {
                this.positions[i].cover(this.positions[covered_index + 1]);
            }
        }

        win.console.log('positions:', this.positions);
        this.up_card = this.deck.drawOne();
        this.up_card.setDrawLocation(this.positions[15].x - 80 * 1.5, this.positions[15].y + 128 * 1.25);
    };

    Game.prototype.draw = function () {
        this.positions.forEach(function (position) {
            position.draw();
        });
        this.up_card.draw();
        if (this.deck.length()) {
            this.deck_div = this.deck.draw(this.up_card.x - 80 * 2, this.up_card.y, this.deck_div);
        } else if (this.deck_div) {
            $(this.deck_div).remove();
            this.deck_div = null;
        }
    };

    Game.prototype.replaceUpCard = function (new_up_card) {
        new_up_card.x = this.up_card.x;
        new_up_card.y = this.up_card.y;
        $(this.up_card.div).remove();
        this.up_card = new_up_card;
    };

    var canChoose = function (card1, card2) {
        return (card1.rank === Position.LAST_RANK && card2.rank === Position.FIRST_RANK) ||
            (card1.rank === Position.FIRST_RANK && card2.rank === Position.LAST_RANK) ||
            (card1.rank === (card2.rank + 1)) ||
            (card1.rank === (card2.rank - 1));
    };

    Game.prototype.update = function () {
        this.draw();
        if (this.positions.length === 0) {
            win.console.log('\n\n\nGAME WON\n\n\n');
            return;
        }
        if (this.deck.length() === 0) {
            // check for game over
            var not_over = this.positions.some(function (position) {
                return !position.isCovered() && canChoose(this.up_card, position);
            }, this);
            if (!not_over) {
                win.console.log('\n\n\nGAME OVER\n\n\n');
            }
        }
    };

    var click_handler = function (event) {
        var position_index = -1;
        var new_up_card;
        if (event.target === this.deck_div) {
            this.replaceUpCard(this.deck.drawOne());
            this.update();
            return false;
        }
        this.positions.forEach(function (position, index) {
            if (position.div === event.target) {
                position_index = index;
            }
        });
        if (position_index === -1) {
            return false;
        }
        if (this.positions[position_index].covered_by.length) {
            return false;
        }
        if (canChoose(this.up_card, this.positions[position_index])) {
            this.positions[position_index].remove();
            new_up_card = this.positions.splice(position_index, 1);
            this.replaceUpCard(new_up_card[0]);
            this.update();
            return false;
        }
    };

    Game.prototype.start = function () {
        if (this.started) {
            return;
        }
        this.update();
        $('.card').click(click_handler.bind(this));
    };

    return Game;
}(this));
