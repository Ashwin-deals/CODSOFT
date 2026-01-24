import os
import json
import datetime

from django.http import JsonResponse, HttpResponseBadRequest, HttpResponseNotAllowed
from django.views.decorators.csrf import csrf_exempt

DATA_PATH = os.path.abspath(
    os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', 'data', 'contacts.json')
)


def _load_contacts():
    try:
        with open(DATA_PATH, 'r', encoding='utf-8') as fh:
            return json.load(fh)
    except (FileNotFoundError, ValueError):
        return []


def _save_contacts(contacts):
    os.makedirs(os.path.dirname(DATA_PATH), exist_ok=True)
    with open(DATA_PATH, 'w', encoding='utf-8') as fh:
        json.dump(contacts, fh, indent=2, ensure_ascii=False)


def _next_id(contacts):
    if not contacts:
        return 1
    try:
        return max(int(c.get('id', 0)) for c in contacts) + 1
    except Exception:
        return 1


def _find_contact(contacts, cid):
    for c in contacts:
        if str(c.get('id')) == str(cid):
            return c
    return None


def contacts_list(request):
    if request.method != 'GET':
        return HttpResponseNotAllowed(['GET'])

    contacts = _load_contacts()

    q = (request.GET.get('q') or '').lower()
    sort_mode = request.GET.get('sort', 'recent')

    if q:
        contacts = [
            c for c in contacts
            if q in str(c.get('name', '')).lower()
            or q in str(c.get('phone', '')).lower()
        ]

    if sort_mode == 'az':
        contacts.sort(key=lambda c: c.get('name', '').lower())
    else:
        contacts.sort(key=lambda c: c.get('created_at', ''), reverse=True)

    favorites = [c for c in contacts if c.get('favorite')]
    others = [c for c in contacts if not c.get('favorite')]
    contacts = favorites + others

    return JsonResponse({'contacts': contacts})


@csrf_exempt
def add_contact(request):
    if request.method != 'POST':
        return HttpResponseNotAllowed(['POST'])
    try:
        payload = json.loads(request.body.decode('utf-8') or '{}')
    except Exception:
        return HttpResponseBadRequest('invalid json')

    name = payload.get('name')
    if not name:
        return HttpResponseBadRequest('missing name')

    contacts = _load_contacts()
    cid = _next_id(contacts)

    contact = {
        'id': cid,
        'name': name,
        'phone': payload.get('phone', ''),
        'email': payload.get('email', ''),
        'address': payload.get('address', ''),
        'favorite': bool(payload.get('favorite', False)),
        'created_at': datetime.datetime.utcnow().isoformat() + 'Z',
    }

    contacts.append(contact)
    _save_contacts(contacts)
    return JsonResponse({'success': True, 'contact': contact})


@csrf_exempt
def update_contact(request):
    if request.method != 'POST':
        return HttpResponseNotAllowed(['POST'])
    try:
        payload = json.loads(request.body.decode('utf-8') or '{}')
    except Exception:
        return HttpResponseBadRequest('invalid json')

    cid = payload.get('id')
    if cid is None:
        return HttpResponseBadRequest('missing id')

    contacts = _load_contacts()
    contact = _find_contact(contacts, cid)
    if contact is None:
        return HttpResponseBadRequest('contact not found')

    for key in ('name', 'phone', 'email', 'address'):
        if key in payload:
            contact[key] = payload.get(key)

    if 'favorite' in payload:
        contact['favorite'] = bool(payload.get('favorite'))

    _save_contacts(contacts)
    return JsonResponse({'success': True, 'contact': contact})


@csrf_exempt
def delete_contact(request):
    if request.method != 'POST':
        return HttpResponseNotAllowed(['POST'])
    try:
        payload = json.loads(request.body.decode('utf-8') or '{}')
    except Exception:
        return HttpResponseBadRequest('invalid json')

    cid = payload.get('id')
    if cid is None:
        return HttpResponseBadRequest('missing id')

    contacts = _load_contacts()
    if _find_contact(contacts, cid) is None:
        return HttpResponseBadRequest('contact not found')

    contacts = [c for c in contacts if str(c.get('id')) != str(cid)]
    _save_contacts(contacts)
    return JsonResponse({'success': True})


@csrf_exempt
def toggle_favorite(request):
    if request.method != 'POST':
        return HttpResponseNotAllowed(['POST'])
    try:
        payload = json.loads(request.body.decode('utf-8') or '{}')
    except Exception:
        return HttpResponseBadRequest('invalid json')

    cid = payload.get('id')
    if cid is None:
        return HttpResponseBadRequest('missing id')

    contacts = _load_contacts()
    contact = _find_contact(contacts, cid)
    if contact is None:
        return HttpResponseBadRequest('contact not found')

    contact['favorite'] = not bool(contact.get('favorite', False))
    _save_contacts(contacts)
    return JsonResponse({'success': True, 'contact': contact})
