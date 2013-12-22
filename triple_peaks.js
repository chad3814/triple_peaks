'use strict';

/*global Deck, Card, $, Image, localStorage*/

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
        var coverer = this;
        this.covering.forEach(function (covered) {
            covered.covered_by = covered.covered_by.filter(function (position) {
                return position !== coverer;
            });
            if (covered.covered_by.length === 0) {
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

    var getHighStreak = function () {
        var high = parseInt(localStorage.getItem('high_streak'), 10);
        if (!isNaN(high)) {
            return high;
        }
        return 0;
    };

    var updateHighStreak = function (current) {
        var high = getHighStreak();
        if (current > high) {
            localStorage.setItem('high_streak', current.toString(10));
            return current;
        }
        return high;
    };

    var getHighScore = function () {
        var high = parseInt(localStorage.getItem('high_score'), 10);
        if (!isNaN(high)) {
            return high;
        }
        return 0;
    };

    var updateHighScore = function (current) {
        var high = getHighScore();
        if (current > high) {
            localStorage.setItem('high_score', current.toString(10));
            return current;
        }
        return high;
    };

    var getHighRound = function () {
        var high = parseInt(localStorage.getItem('high_round'), 10);
        if (!isNaN(high)) {
            return high;
        }
        return 1;
    };

    var updateHighRound = function (current) {
        var high = getHighRound();
        if (current > high) {
            localStorage.setItem('high_round', current.toString(10));
            return current;
        }
        return high;
    };

    Game.prototype.draw = function () {
        this.$streak.text(this.streak);
        this.$score.text(this.score.toLocaleString());
        this.$round.text(this.round);

        this.$high_streak.text(updateHighStreak(this.streak));
        this.$high_score.text(updateHighScore(this.score).toLocaleString());
        this.$high_round.text(updateHighRound(this.round));

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

        $(new_up_card.div).animate({
            top: this.up_card_position.y + 'px',
            left: this.up_card_position.x + 'px'
        }, dist / this.speed * 1000, function () {
            $(current_div).remove();
        });
    };

    var canChoose = function (card1, card2) {
        return (card1.rank === Position.LAST_RANK && card2.rank === Position.FIRST_RANK) ||
            (card1.rank === Position.FIRST_RANK && card2.rank === Position.LAST_RANK) ||
            (card1.rank === (card2.rank + 1)) ||
            (card1.rank === (card2.rank - 1));
    };

    Game.prototype.showMessage = function ($message) {
        var $message_container = $('<div>')
            .addClass('message_container')
            .append($('<div>')
                    .append($message));

        $('body').append($message_container);
        return $message_container;
    };

    Game.prototype.showScore = function (points, position) {
        var $score_bubble = $('<div>')
            .addClass('score_bubble')
            .text(points.toLocaleString())
            .css({
                top: (position.y + 32) + 'px',
                left: (position.x + 8) + 'px'
            })
            .appendTo($('body'));

        var top = this.$score.parent().position().top;
        var left = this.$score.parent().position().left + (this.$score.parent().width() / 2);
        var dist = distance({x: position.x + 8, y: position.y + 32}, {x: left, y: top}) * 2.5;
        $score_bubble.animate({
            top: top + 'px',
            left: left + 'px'
        }, dist / this.speed * 1000, function () {
            $score_bubble.remove();
        });

        return $score_bubble;
    };

    Game.prototype.showBonusScore = function (points, position) {
        var $score_bubble = $('<div>')
            .addClass('score_bubble bonus_bubble')
            .text(points.toLocaleString())
            .css({
                top: (position.y + 80) + 'px',
                left: (position.x + 8) + 'px'
            })
            .appendTo($('body'));

        var top = this.$score.parent().position().top;
        var left = this.$score.parent().position().left + (this.$score.parent().width() / 2);
        var dist = distance({x: position.x + 8, y: position.y + 80}, {x: left, y: top}) * 2.5;
        $score_bubble.animate({
            top: top + 'px',
            left: left + 'px'
        }, dist / this.speed * 1000, function () {
            $score_bubble.remove();
        });

        return $score_bubble;
    };

    Game.prototype.update = function () {
        var $message;           // forward declaration
        this.draw();
        if (this.positions.length === 0) {
            this.next_peak -= 250;
            var deck_bonus = 100 * (this.deck.length() + 1);
            var round_bonus = 1000;
            var $round_end = $('<div>').addClass('message')
                .append($('<h3>').text('End of Round'))
                .append($('<div>')
                        .append($('<span>').addClass('round_score').text(this.score.toLocaleString()))
                        .append($('<span>').text('Base Score')))
                .append($('<div>')
                        .append($('<span>').addClass('round_score').text(round_bonus.toLocaleString()))
                        .append($('<span>').text('Round Bonus')))
                .append($('<div>')
                        .append($('<span>').addClass('round_score').text(deck_bonus.toLocaleString()))
                        .append($('<span>').text('Deck Bonus')))
                .append($('<hr>'))
                .append($('<div>')
                        .append($('<span>').addClass('round_score').text((this.score + round_bonus + deck_bonus).toLocaleString()))
                        .append($('<span>').text('Total')));
            this.score += round_bonus;
            this.score += deck_bonus;
            newRound.call(this);
            $message = this.showMessage($round_end);
            $round_end.click(function (event) {
                $message.remove();
                this.update();
            }.bind(this));
        }

        if (this.deck.length() === 0) {
            // check for game over
            var not_over = this.positions.some(function (position) {
                return !position.isCovered() && canChoose(this.up_card, position);
            }, this);
            if (!not_over) {
                var $game_over = $('<div>')
                    .addClass('game_over')
                    .text('Game Over');
                $message = this.showMessage($game_over);
                this.started = false;
                $game_over.click(function () {
                    $message.remove();
                    this.start(true);
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
            this.showScore(this.next_score, this.positions[position_index]);
            this.score += this.next_score;
            this.next_score *= 2;
            this.streak++;
            if (this.positions[position_index].bonus) {
                this.showBonusScore(this.next_peak, this.positions[position_index]);
                this.score += this.next_peak;
                this.next_peak += 250;
            }
            this.positions[position_index].remove();
            new_up_card = this.positions.splice(position_index, 1);
            this.replaceUpCard(new_up_card[0]);
            this.update();
            return false;
        }
    };

    Game.prototype.start = function (no_instructions) {
        if (this.started) {
            return;
        }
        this.started = true;
        this.next_score = 10;
        this.next_peak = 500;
        this.streak = 0;
        this.score = 0;
        this.round = 0;
        this.high_streak = getHighStreak();
        this.high_score = getHighScore();
        this.high_round = getHighRound();
        this.$streak = $('<span>');
        this.$score = $('<span>');
        this.$round = $('<span>');
        $('.streak').remove();
        $('.score').remove();
        $('.round').remove();
        this.$high_streak = $('<span>');
        this.$high_score = $('<span>');
        this.$high_round = $('<span>');
        $('.high_streak').remove();
        $('.high_score').remove();
        $('.high_round').remove();
        $('.high_box').remove();
        $('body')
            .append($('<div>')
                    .addClass('score_box')
                    .append($('<div>')
                            .addClass('streak')
                            .append(this.$streak))
                    .append($('<div>')
                            .addClass('score')
                            .append(this.$score))
                    .append($('<div>')
                            .addClass('round')
                            .append(this.$round)))
            .append($('<div>')
                    .addClass('score_box')
                    .css('position', 'absolute')
                    .css('top', '500px')
                    .css('width', '821px')
                    .append($('<div>')
                            .addClass('high_streak')
                            .append(this.$high_streak))
                    .append($('<div>')
                            .addClass('high_score')
                            .append(this.$high_score))
                    .append($('<div>')
                            .addClass('high_round')
                            .append(this.$high_round)));

        newRound.call(this);
        if (no_instructions) {
            return this.update();
        }

        // loop to try to load all svg's before they are used
        Card.ranks.forEach(function (rank) {
            if (rank === 'G') {
                // no jokes
                return;
            }
            Card.suits.forEach(function (suit) {
                new Image().src = 'svg/' + rank + suit + '.svg';
            });
        });

        var $instructions = $('<div>')
            .addClass('message')
            .append($('<h3>').text('How To Play'))
            .append($('<ul>')
                    .append($('<li>').text('Choose a card one higher or one lower then the up card'))
                    .append($('<li>').text('Aces are both high and low'))
                    .append($('<li>').text('If there are no matches for the up card, click on the deck'))
                    .append($('<li>').text('Try to create long runs of matches'))
                    .append($('<li>').text('The game ends when there are no more matches and the deck is empty'))
                    .append($('<li>').text('If you clear all the cards, you\'ll continue in another round')));

        var $message = this.showMessage($instructions);
        $instructions.click(function (event) {
            $message.remove();
            this.update();
        }.bind(this));
    };

    return Game;
}(this));
