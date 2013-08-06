'use strict';

/*global Deck, Card, $*/

// scoring
// starting at 10, each card in the streak doubles the last point value
// so 10, 20, 40, 80, 160, etc..
// last card in a peak is worth a bonus starting at 500 and increasing
// each next peak by 250. the peak bonus goes down by 250 at the start
// of a new round, so in round 1, 500, 750, 1000, in round 2, 750, 1000, 1250
// at the end of a round get a bonus of 1000 for clearing
// and a bonus of 100 per card still in the deck (counting up card)

var distance = function (pos1, pos2) {
    var x2 = (pos1.x - pos2.x) * (pos1.x - pos2.x);
    var y2 = (pos1.y - pos2.y) * (pos1.y - pos2.y);
    return Math.sqrt(x2 + y2);
};

var Position = (function (win) {
    var Position = function (rank, suit) {
        Card.call(this, rank, suit);
        this.covered_by = [];
        this.covering = [];
        this.div = null;
        this.x = 0;
        this.y = 0;
        this.bonus = false;
    };

    Position.prototype = new Card();

    Position.prototype.cover = function (position) {
        position.covered_by.push(this);
        this.covering.push(position);
    };

    Position.prototype.remove = function () {
        console.log('removing', this.toString());
        var coverer = this;
        this.covering.forEach(function (covered) {
            console.log('it covered', covered.toString());
            covered.covered_by = covered.covered_by.filter(function (position) {
                return position !== coverer;
            });
            if (covered.covered_by.length === 0) {
                console.log('covered is now not covered by anything');
                covered.backToFront(covered.div);
            }
        }, this);
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
        return;
    };

    var click_handler;
    var newRound = function () {
        this.round++;
        $('.card').remove();
        this.deck = new Deck(Position);
        this.deck.shuffle();
        this.positions = [];
        this.deck_div = null;
        var x;
        var i;
        for (i = 0; i < 28; i++) {
            this.positions.push(this.deck.drawOne());
        }
        // first row
        this.positions[0].setDrawLocation(120, 32);
        this.positions[0].bonus = true;
        this.positions[1].setDrawLocation(360, 32);
        this.positions[1].bonus = true;
        this.positions[2].setDrawLocation(600, 32);
        this.positions[2].bonus = true;

        // second row
        x = 80;
        this.positions[3].setDrawLocation(x, 96);
        this.positions[3].cover(this.positions[0]);
        this.positions[4].setDrawLocation(x + 80, 96);
        this.positions[4].cover(this.positions[0]);

        x = 320;
        this.positions[5].setDrawLocation(x, 96);
        this.positions[5].cover(this.positions[1]);
        this.positions[6].setDrawLocation(x + 80, 96);
        this.positions[6].cover(this.positions[1]);

        x = 560;
        this.positions[7].setDrawLocation(x, 96);
        this.positions[7].cover(this.positions[2]);
        this.positions[8].setDrawLocation(x + 80, 96);
        this.positions[8].cover(this.positions[2]);

        // third row
        x = 40;
        this.positions[9].setDrawLocation(x, 160);
        this.positions[9].cover(this.positions[3]);
        this.positions[10].setDrawLocation(x + 80, 160);
        this.positions[10].cover(this.positions[3]);
        this.positions[10].cover(this.positions[4]);
        this.positions[11].setDrawLocation(x + 160, 160);
        this.positions[11].cover(this.positions[4]);

        this.positions[12].setDrawLocation(x + 240, 160);
        this.positions[12].cover(this.positions[5]);
        this.positions[13].setDrawLocation(x + 320, 160);
        this.positions[13].cover(this.positions[5]);
        this.positions[13].cover(this.positions[6]);
        this.positions[14].setDrawLocation(x + 400, 160);
        this.positions[14].cover(this.positions[6]);

        this.positions[15].setDrawLocation(x + 480, 160);
        this.positions[15].cover(this.positions[7]);
        this.positions[16].setDrawLocation(x + 560, 160);
        this.positions[16].cover(this.positions[7]);
        this.positions[16].cover(this.positions[8]);
        this.positions[17].setDrawLocation(x + 640, 160);
        this.positions[17].cover(this.positions[8]);

        // fourth row
        this.positions[18].setDrawLocation(0, 224);
        this.positions[18].cover(this.positions[9]);

        this.positions[19].setDrawLocation(80, 224);
        this.positions[19].cover(this.positions[9]);
        this.positions[19].cover(this.positions[10]);

        this.positions[20].setDrawLocation(160, 224);
        this.positions[20].cover(this.positions[10]);
        this.positions[20].cover(this.positions[11]);

        this.positions[21].setDrawLocation(240, 224);
        this.positions[21].cover(this.positions[11]);
        this.positions[21].cover(this.positions[12]);

        this.positions[22].setDrawLocation(320, 224);
        this.positions[22].cover(this.positions[12]);
        this.positions[22].cover(this.positions[13]);

        this.positions[23].setDrawLocation(400, 224);
        this.positions[23].cover(this.positions[13]);
        this.positions[23].cover(this.positions[14]);

        this.positions[24].setDrawLocation(480, 224);
        this.positions[24].cover(this.positions[14]);
        this.positions[24].cover(this.positions[15]);

        this.positions[25].setDrawLocation(560, 224);
        this.positions[25].cover(this.positions[15]);
        this.positions[25].cover(this.positions[16]);

        this.positions[26].setDrawLocation(640, 224);
        this.positions[26].cover(this.positions[16]);
        this.positions[26].cover(this.positions[17]);

        this.positions[27].setDrawLocation(720, 224);
        this.positions[27].cover(this.positions[17]);

        this.up_card = this.deck.drawOne();
        if (!this.up_card_position) {
            this.up_card_position = {
                x: this.positions[27].x - 80 * 1.5,
                y: this.positions[27].y + 128 * 1.25
            };
        }
        this.up_card.setDrawLocation(this.up_card_position.x, this.up_card_position.y);

        if (!this.speed) {
            this.speed = distance(this.up_card, this.positions[0]) / 0.5;
        }

        this.draw();
        $('.card').click(click_handler.bind(this));
    };

    Game.prototype.draw = function () {
        this.$streak.text(this.streak);
        this.$score.text(this.score);
        this.$round.text(this.round);
        this.positions.forEach(function (position) {
            if (!position.div) {
                position.draw();
            }
        });
        this.up_card.draw();
        if (this.deck.length()) {
            this.deck_div = this.deck.draw(this.up_card_position.x - 80 * 2, this.up_card_position.y, this.deck_div);
        } else if (this.deck_div) {
            $(this.deck_div).remove();
            this.deck_div = null;
        }
    };

    Game.prototype.replaceUpCard = function (new_up_card) {
        var current_div = this.up_card.div;
        this.up_card = new_up_card;
        var dist = distance(new_up_card, this.up_card_position);
        console.log('animating for', dist / this.speed);
        $(new_up_card.div).animate({
            top: this.up_card_position.y + 'px',
            left: this.up_card_position.x + 'px'
        }, dist / this.speed * 1000, function () {
            console.log('animation done');
            $(current_div).remove();
        });
    };

    var canChoose = function (card1, card2) {
        return (card1.rank === Position.LAST_RANK && card2.rank === Position.FIRST_RANK) ||
            (card1.rank === Position.FIRST_RANK && card2.rank === Position.LAST_RANK) ||
            (card1.rank === (card2.rank + 1)) ||
            (card1.rank === (card2.rank - 1));
    };

    Game.prototype.update = function () {
        this.draw();
        win.console.log('Score:', this.score);
        if (this.positions.length === 0) {
            this.next_peak -= 250;
            this.score += 1000; // round bonus
            this.score += 100 * (this.deck.length() + 1);
            newRound.call(this);
            return this.update();
        }

        if (this.deck.length() === 0) {
            // check for game over
            var not_over = this.positions.some(function (position) {
                return !position.isCovered() && canChoose(this.up_card, position);
            }, this);
            if (!not_over) {
                win.console.log('\n\n\nGAME OVER\n\n\n');
                var $game_over = $('<div>').addClass('game_over').text('Game Over');
                $('body').append($game_over);
                this.started = false;
                $game_over.click(function () {
                    $game_over.remove();
                    this.start();
                }.bind(this));
            }
        }
    };

    click_handler = function (event) {
        var position_index = -1;
        var new_up_card;
        var pos;
        if (event.currentTarget === this.deck_div) {
            this.streak = 0;
            this.next_score = 10;
            new_up_card = this.deck.drawOne();
            pos = $(this.deck_div).position();
            new_up_card.setDrawLocation(pos.left, pos.top);
            console.log('draw on deck', new_up_card);
            new_up_card.draw();
            this.replaceUpCard(new_up_card);
            this.update();
            return false;
        }
        this.positions.forEach(function (position, index) {
            if (position.div === event.currentTarget) {
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
            this.score += this.next_score;
            this.next_score *= 2;
            this.streak++;
            if (this.positions[position_index].bonus) {
                this.score += this.next_peak;
                this.next_peak += 250;
            }
            console.log('card clicked, removing', this.positions[position_index].toString());
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
        this.started = true;
        this.score = 0;
        this.next_score = 10;
        this.next_peak = 500;
        this.round = 0;
        this.streak = 0;
        this.$streak = $('<span>');
        this.$score = $('<span>');
        this.$round = $('<span>');
        $('.streak').remove();
        $('.score').remove();
        $('.round').remove();
        $('body')
            .append($('<div>')
                    .addClass('streak')
                    .append(this.$streak))
            .append($('<div>')
                    .addClass('score')
                    .append(this.$score))
            .append($('<div>')
                    .addClass('round')
                    .append(this.$round));

        newRound.call(this);
        this.update();
    };

    return Game;
}(this));
