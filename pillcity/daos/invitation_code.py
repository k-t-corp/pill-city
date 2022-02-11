from typing import List
from pillcity.models import InvitationCode
from pillcity.utils.make_uuid import make_dashless_uuid


def create_invitation_code() -> str:
    """
    Create a new invitation code

    :return: The new invitation code
    """
    code = make_dashless_uuid()
    new_code = InvitationCode()
    new_code.code = code
    new_code.claimed = False
    new_code.save()
    return code


def check_invitation_code(code: str) -> bool:
    """
    Check if an invitation code exists and is unclaimed

    :param code: The checked invitation code
    :return: Whether the invitation code exists and is unclaimed
    """
    codes = InvitationCode.objects(code=code, claimed=False)
    if not codes:
        return False
    return True


def claim_invitation_code(code: str) -> bool:
    """
    Claim an invitation code

    :param code: The claimed invitation code
    :return: Whether the claim was successful
    """
    if not check_invitation_code(code):
        return False
    code = InvitationCode.objects.get(code=code)
    code.claimed = True
    code.save()
    return True


def get_invitation_codes() -> List[InvitationCode]:
    """
    Get all invitation codes, reverse chronologically ordered

    :return: All invitation codes
    """
    return list(InvitationCode.objects().order_by('-id'))
