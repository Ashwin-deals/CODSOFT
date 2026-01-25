# Simple Movie Recommendation System (content-based)
# - Loads movies from movies.csv
# - Menu: set preferences, get recommendations, search, exit
# - Stores user preferences and ratings in history.txt

import csv
import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MOVIES_CSV = os.path.join(BASE_DIR, 'movies.csv')
HISTORY_FILE = os.path.join(BASE_DIR, 'history.txt')


def load_movies():
    """Load movies from MOVIES_CSV into a list of dicts."""
    movies = []
    if not os.path.exists(MOVIES_CSV):
        print('movies.csv not found in this folder.')
        return movies

    with open(MOVIES_CSV, newline='', encoding='utf-8') as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            try:
                title = row.get('title', '').strip()
                genre = row.get('genre', '').strip()
                year = int(row.get('year', 0))
                if title and genre:
                    movies.append({
                        'title': title,
                        'genre': genre,
                        'year': year,
                    })
            except Exception:
                continue

    return movies


def load_history():
    """Load user preferences and ratings from HISTORY_FILE."""
    prefs = []
    ratings = {}
    if not os.path.exists(HISTORY_FILE):
        return prefs, ratings

    with open(HISTORY_FILE, encoding='utf-8') as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            if line.startswith('PREF:'):
                raw = line[len('PREF:'):]
                prefs = [p.strip() for p in raw.split(',') if p.strip()]
            elif line.startswith('RATING:'):
                raw = line[len('RATING:'):]
                parts = raw.split('|')
                if len(parts) >= 2:
                    title = parts[0].strip()
                    try:
                        rating = int(parts[1])
                    except Exception:
                        rating = 0
                    ratings[title] = rating
    return prefs, ratings


def save_history(prefs, ratings):
    """Save preferences and ratings to HISTORY_FILE."""
    with open(HISTORY_FILE, 'w', encoding='utf-8') as fh:
        if prefs:
            fh.write('PREF:' + ','.join(prefs) + '\n')
        for title, rating in ratings.items():
            fh.write(f'RATING:{title}|{rating}\n')


def set_preferences():
    raw = input('Enter preferred genres (comma-separated, e.g. Action, Sci-Fi): ').strip()
    prefs = [p.strip().title() for p in raw.split(',') if p.strip()]
    print('Preferences set to:', ', '.join(prefs) if prefs else 'None')
    return prefs


def recommend(movies, prefs, ratings):
    """Get recommendations sorted by score."""
    if not movies:
        print('No movies available to recommend.')
        return []

    title_to_year = {m['title']: m['year'] for m in movies}
    high_years = [title_to_year.get(t) for t, r in ratings.items() if r >= 4 and title_to_year.get(t)]

    scored = []
    for m in movies:
        s = 0

        if prefs and m['genre'] in prefs:
            s += 2

        for hy in high_years:
            if abs(m['year'] - hy) <= 5:
                s += 1
                break

        if s > 0 or not prefs:
            scored.append((s, m))

    scored.sort(key=lambda x: (x[0], x[1]['year'], x[1]['title']), reverse=True)
    return scored


def show_recommendations(scored):
    if not scored:
        print('No recommendations found.')
        return
    for idx, (s, m) in enumerate(scored, start=1):
        print(f'{idx}. {m["title"]} ({m["year"]}) - {m["genre"]} [score={s}]')


def search_movie(movies):
    q = input('Enter movie name to search: ').strip().lower()
    if not q:
        print('Empty query.')
        return

    found = [m for m in movies if q in m['title'].lower()]
    if not found:
        print('No matching movies found.')
        return

    for m in found:
        print(f"Title: {m['title']}\nGenre: {m['genre']}\nYear: {m['year']}\n---")


def prompt_int(prompt, default=None, minv=None, maxv=None):
    while True:
        val = input(prompt).strip()
        if not val:
            if default is not None:
                return default
            print('Please enter a value.')
            continue
        try:
            n = int(val)
        except ValueError:
            print('Please enter a valid integer.')
            continue
        if minv is not None and n < minv:
            print('Value too small.')
            continue
        if maxv is not None and n > maxv:
            print('Value too large.')
            continue
        return n


def main():
    movies = load_movies()
    prefs, ratings = load_history()

    print('Welcome to the Movie Recommendation System')

    while True:
        print('\nMenu:')
        print('1. Set Preferences')
        print('2. Get Recommendations')
        print('3. Search Movie')
        print('4. Exit')
        choice = input('Choose an option (1-4): ').strip()

        if choice == '1':
            prefs = set_preferences()
            save_history(prefs, ratings)

        elif choice == '2':
            scored = recommend(movies, prefs, ratings)
            n = prompt_int('How many recommendations do you want? (e.g. 3): ', default=3, minv=1)
            top = scored[:n]
            show_recommendations(top)

            if top:
                while True:
                    idx = input(f'Enter a number between 1 and {len(top)} to rate (or press Enter to skip): ').strip()
                    if not idx:
                        break
                    try:
                        i = int(idx)
                    except ValueError:
                        print('Enter a valid index number.')
                        continue
                    if i < 1 or i > len(top):
                        print('Index out of range.')
                        continue
                    title = top[i - 1][1]['title']
                    r = prompt_int(f'Rate "{title}" (1-5): ', minv=1, maxv=5)
                    ratings[title] = r
                    save_history(prefs, ratings)
                    print(f'Rating saved for {title}.')

        elif choice == '3':
            search_movie(movies)

        elif choice == '4':
            print('Goodbye.')
            save_history(prefs, ratings)
            break

        else:
            print('Invalid choice, enter 1-4.')


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('\nExiting...')
        sys.exit(0)
