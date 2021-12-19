from typing import Optional
from werkzeug.security import generate_password_hash
from mini_gplus.models import PasswordResetClaim
from mini_gplus.utils.make_uuid import make_dashless_uuid
from mini_gplus.utils.now_ms import now_seconds
from .user_cache import get_users_in_user_cache, set_in_user_cache


CLAIM_EXPIRATION_SECONDS = 60


def forget_password(email: str) -> Optional[str]:
    """
    Check whether a password reset claim for an email
    If email does not exist, fails
    If a claim for an existent email does not exist, succeeds and return claim id
    If a claim for an existent email exists and unexpired, fails
    If a claim for an existent email exists but expired, succeeds and return new claim id

    :param email: The email to check
    :return: Claim code for this email if success
    """
    # check if email exists
    user_with_email = None
    for user in get_users_in_user_cache():
        if user.email == email:
            user_with_email = user
            break
    if not user_with_email:
        return None

    # check if a claim for this email exists
    claims = PasswordResetClaim.objects(email=email)
    if not claims:
        code = make_dashless_uuid()
        new_claim = PasswordResetClaim()
        new_claim.email = email
        new_claim.code = code
        new_claim.expire_at = now_seconds() + CLAIM_EXPIRATION_SECONDS
        new_claim.save()
        return code

    # check if existing claim has NOT expired
    if len(claims) > 1:
        raise RuntimeError(f'More than one PasswordReset claim for email {email} found!')
    claim = claims[0]
    if now_seconds() < claim.expire_at:
        return None

    # update the existing claim with new expiration and new code
    code = make_dashless_uuid()
    claim.code = code
    claim.expire_at = now_seconds() + CLAIM_EXPIRATION_SECONDS
    claim.save()

    return code


def reset_password(code: str, new_password: str) -> bool:
    """
    Resets password for the user that's associated with the email associated with the provided code

    :param code: The claim code
    :param new_password: New password
    :return: Whether reset was successful
    """
    # check if claim exists
    claims = PasswordResetClaim.objects(code=code)
    if not claims:
        return False
    if len(claims) > 1:
        raise RuntimeError(f'More than one PasswordReset claim for code {code} found!')
    claim = claims[0]

    # find the user associated with the claim
    email = claim.email
    user_with_email = None
    for user in get_users_in_user_cache():
        if user.email == email:
            user_with_email = user
            break
    if not user_with_email:
        return False

    # resets password and remove claim
    user_with_email.password = generate_password_hash(new_password)
    user_with_email.save()
    set_in_user_cache(user_with_email)
    claim.delete()

    return True
